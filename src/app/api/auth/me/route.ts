import { withAuth } from "@/middlewares/with-auth";
import { withErrorHandling } from "@/middlewares/error-handler";
import { getCurrentUserProfile } from "@/controllers/auth.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAuth(async (_req, _ctx, session) => {
    const profile = await getCurrentUserProfile(session.sub);
    return ok(profile);
  })
);
