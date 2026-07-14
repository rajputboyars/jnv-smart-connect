import { apiFetch } from "@/lib/api-client";
import type { AuthUser } from "@/services/auth.service";
import type { UpdateProfileInput, ChangePasswordInput } from "@/validators/user.validator";

export async function updateProfileRequest(input: UpdateProfileInput) {
  const res = await apiFetch<AuthUser>("/api/users/me", {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as AuthUser;
}

export async function changePasswordRequest(input: ChangePasswordInput) {
  const res = await apiFetch<null>("/api/users/me/password", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.message ?? "Password updated";
}
