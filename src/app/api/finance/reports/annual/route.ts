import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { getAnnualReport } from "@/controllers/finance-reports.controller";
import { ApiError } from "@/lib/utils/api-error";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    if (!session.school) throw ApiError.badRequest("Your account is not linked to a school");
    const academicYear = req.nextUrl.searchParams.get("academicYear");
    if (!academicYear) throw ApiError.badRequest("academicYear is required");
    const report = await getAnnualReport(session.school, academicYear);
    if (!report) throw ApiError.notFound("Academic year not found");
    return ok(report);
  })
);
