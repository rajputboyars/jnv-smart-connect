import crypto from "crypto";
import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { ActivityLog } from "@/models/ActivityLog";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { createSession, destroySession } from "@/lib/auth/session";
import { sendMail } from "@/lib/email/mailer";
import { passwordResetEmail, welcomeEmail } from "@/lib/email/templates";
import { ApiError } from "@/lib/utils/api-error";
import type {
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  RegisterInput,
} from "@/validators/auth.validator";
import type { Role } from "@/types/roles";

const RESET_TOKEN_BYTES = 32;

function hashToken(token: string) {
  return crypto.createHash("sha256").update(token).digest("hex");
}

/**
 * Creates a login for a staff/parent/student profile being provisioned by an
 * admin (e.g. adding a Teacher). The account gets an unusable random
 * password and an immediate "set your password" link — we never email a
 * plaintext password.
 */
export async function provisionLinkedAccount(
  role: Role,
  info: { name: string; email: string; phone?: string },
  school?: string
) {
  await connectDB();

  const existing = await User.findOne({ email: info.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const unusablePassword = await hashPassword(crypto.randomBytes(32).toString("hex"));

  const user = await User.create({
    name: info.name,
    email: info.email.toLowerCase(),
    password: unusablePassword,
    role,
    phone: info.phone || undefined,
    school,
  });

  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const expiresMinutes = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MIN ?? 30);

  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password/${rawToken}`;

  await sendMail({
    to: user.email,
    subject: "Welcome to JNV Smart Connect — set your password",
    html: passwordResetEmail(user.name, resetUrl, expiresMinutes),
  });

  return user;
}

export async function registerStaffAccount(
  input: RegisterInput,
  createdBy: { id: string; school?: string }
) {
  await connectDB();

  const existing = await User.findOne({ email: input.email.toLowerCase() });
  if (existing) {
    throw ApiError.conflict("An account with this email already exists");
  }

  const user = await User.create({
    name: input.name,
    email: input.email.toLowerCase(),
    password: await hashPassword(input.password),
    role: input.role,
    phone: input.phone || undefined,
    school: createdBy.school,
  });

  await ActivityLog.create({
    user: createdBy.id,
    action: "auth.register",
    entityType: "User",
    entityId: user._id,
    metadata: { createdRole: input.role },
    school: createdBy.school,
  });

  await sendMail({
    to: user.email,
    subject: "Welcome to JNV Smart Connect",
    html: welcomeEmail(user.name, user.role, `${process.env.APP_URL ?? "http://localhost:3000"}/login`),
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as Role,
  };
}

export async function loginUser(input: LoginInput, meta: { ip?: string; userAgent?: string }) {
  await connectDB();

  const user = await User.findOne({ email: input.email.toLowerCase() }).select(
    "+password"
  );

  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  const isValid = await verifyPassword(input.password, user.password);
  if (!isValid) {
    throw ApiError.unauthorized("Invalid email or password");
  }

  await createSession({
    sub: user._id.toString(),
    role: user.role,
    school: user.school?.toString(),
    name: user.name,
    email: user.email,
  });

  user.lastLoginAt = new Date();
  await user.save();

  await ActivityLog.create({
    user: user._id,
    action: "auth.login",
    entityType: "User",
    entityId: user._id,
    school: user.school,
    ipAddress: meta.ip,
    userAgent: meta.userAgent,
  });

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role as Role,
    avatarUrl: user.avatarUrl,
  };
}

export async function logoutUser(userId?: string) {
  await destroySession();
  if (userId) {
    await connectDB();
    await ActivityLog.create({ user: userId, action: "auth.logout" });
  }
}

export async function getCurrentUserProfile(userId: string) {
  await connectDB();
  const user = await User.findById(userId).lean();
  if (!user || !user.isActive) {
    throw ApiError.unauthorized("Session expired, please sign in again");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
    school: user.school?.toString(),
  };
}

export async function requestPasswordReset(input: ForgotPasswordInput) {
  await connectDB();

  const user = await User.findOne({ email: input.email.toLowerCase() });

  // Always behave the same whether or not the account exists, to avoid
  // leaking which emails are registered.
  if (!user) {
    return { message: "If an account exists for that email, a reset link has been sent." };
  }

  const rawToken = crypto.randomBytes(RESET_TOKEN_BYTES).toString("hex");
  const expiresMinutes = Number(process.env.PASSWORD_RESET_TOKEN_EXPIRES_MIN ?? 30);

  user.passwordResetToken = hashToken(rawToken);
  user.passwordResetExpires = new Date(Date.now() + expiresMinutes * 60 * 1000);
  await user.save();

  const resetUrl = `${process.env.APP_URL ?? "http://localhost:3000"}/reset-password/${rawToken}`;

  await sendMail({
    to: user.email,
    subject: "Reset your JNV Smart Connect password",
    html: passwordResetEmail(user.name, resetUrl, expiresMinutes),
  });

  return { message: "If an account exists for that email, a reset link has been sent." };
}

export async function resetPassword(input: ResetPasswordInput) {
  await connectDB();

  const hashed = hashToken(input.token);
  const user = await User.findOne({
    passwordResetToken: hashed,
    passwordResetExpires: { $gt: new Date() },
  }).select("+passwordResetToken +passwordResetExpires");

  if (!user) {
    throw ApiError.badRequest("This reset link is invalid or has expired");
  }

  user.password = await hashPassword(input.password);
  user.passwordResetToken = undefined;
  user.passwordResetExpires = undefined;
  await user.save();

  await ActivityLog.create({
    user: user._id,
    action: "auth.password_reset",
    school: user.school,
  });

  return { message: "Password updated successfully. You can now sign in." };
}
