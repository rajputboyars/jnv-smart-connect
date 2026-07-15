import { withErrorHandling } from "@/middlewares/error-handler";
import { getRefreshToken } from "@/lib/auth/session";
import { refreshSession } from "@/controllers/auth.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(async () => {
  const refreshToken = await getRefreshToken();
  const user = await refreshSession(refreshToken);
  return ok(user, { message: "Session refreshed" });
});
