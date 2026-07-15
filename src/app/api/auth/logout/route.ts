import { withErrorHandling } from "@/middlewares/error-handler";
import { getAccessTokenPayload } from "@/lib/auth/session";
import { logoutUser } from "@/controllers/auth.controller";
import { ok } from "@/lib/utils/api-response";

export const POST = withErrorHandling(async () => {
  const session = await getAccessTokenPayload();
  await logoutUser(session?.sub);
  return ok(null, { message: "Signed out" });
});
