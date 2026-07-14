import { apiFetch } from "@/lib/api-client";
import type { Role } from "@/types/roles";
import type {
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
} from "@/validators/auth.validator";

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  role: Role;
  phone?: string;
  avatarUrl?: string;
  school?: string;
}

export async function loginRequest(input: LoginInput) {
  const res = await apiFetch<AuthUser>("/api/auth/login", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as AuthUser;
}

export async function logoutRequest() {
  await apiFetch<null>("/api/auth/logout", { method: "POST" });
}

export async function getCurrentUserRequest() {
  const res = await apiFetch<AuthUser>("/api/auth/me", { method: "GET" });
  return res.data as AuthUser;
}

export async function forgotPasswordRequest(input: ForgotPasswordInput) {
  const res = await apiFetch<null>("/api/auth/forgot-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.message ?? "If an account exists for that email, a reset link has been sent.";
}

export async function resetPasswordRequest(input: ResetPasswordInput) {
  const res = await apiFetch<null>("/api/auth/reset-password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.message ?? "Password updated successfully.";
}
