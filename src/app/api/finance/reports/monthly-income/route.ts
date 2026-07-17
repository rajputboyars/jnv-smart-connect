import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { getMonthlyIncomeReport } from "@/controllers/finance-reports.controller";
import { ApiError } from "@/lib/utils/api-error";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    if (!session.school) throw ApiError.badRequest("Your account is not linked to a school");
    const year = Number(req.nextUrl.searchParams.get("year") ?? new Date().getFullYear());
    const report = await getMonthlyIncomeReport(session.school, year);
    return ok(report);
  })
);
