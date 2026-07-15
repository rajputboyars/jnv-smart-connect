import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { getAnalyticsOverview } from "@/controllers/analytics.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ANALYTICS_VIEW, async (_req, _ctx, session) => {
    const overview = await getAnalyticsOverview(session.school);
    return ok(overview);
  })
);
