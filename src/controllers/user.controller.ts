import { connectDB } from "@/lib/db/connect";
import { User } from "@/models/User";
import { ActivityLog } from "@/models/ActivityLog";
import { hashPassword, verifyPassword } from "@/lib/auth/password";
import { ApiError } from "@/lib/utils/api-error";
import type { UpdateProfileInput, ChangePasswordInput } from "@/validators/user.validator";

export async function updateOwnProfile(userId: string, input: UpdateProfileInput) {
  await connectDB();

  const user = await User.findByIdAndUpdate(
    userId,
    { name: input.name, phone: input.phone || undefined },
    { new: true }
  );

  if (!user) {
    throw ApiError.notFound("User not found");
  }

  return {
    id: user._id.toString(),
    name: user.name,
    email: user.email,
    role: user.role,
    phone: user.phone,
    avatarUrl: user.avatarUrl,
  };
}

export async function changeOwnPassword(userId: string, input: ChangePasswordInput) {
  await connectDB();

  const user = await User.findById(userId).select("+password");
  if (!user) {
    throw ApiError.notFound("User not found");
  }

  const isValid = await verifyPassword(input.currentPassword, user.password);
  if (!isValid) {
    throw ApiError.badRequest("Current password is incorrect");
  }

  user.password = await hashPassword(input.newPassword);
  await user.save();

  await ActivityLog.create({
    user: user._id,
    action: "auth.password_change",
    school: user.school,
  });

  return { message: "Password updated successfully" };
}
