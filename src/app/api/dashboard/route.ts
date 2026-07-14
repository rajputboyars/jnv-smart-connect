import { withErrorHandling } from "@/middlewares/error-handler";
import { withAuth } from "@/middlewares/with-auth";
import { getDashboardForSession } from "@/controllers/dashboard.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAuth(async (_req, _ctx, session) => {
    const data = await getDashboardForSession(session);
    return ok(data);
  })
);
