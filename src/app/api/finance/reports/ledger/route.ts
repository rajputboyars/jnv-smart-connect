import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { financeReportQuerySchema } from "@/validators/finance.validator";
import { getGeneralLedger } from "@/controllers/finance-reports.controller";
import { ApiError } from "@/lib/utils/api-error";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    if (!session.school) throw ApiError.badRequest("Your account is not linked to a school");
    const params = req.nextUrl.searchParams;
    const query = financeReportQuerySchema.parse({
      from: params.get("from") ?? "",
      to: params.get("to") ?? "",
    });
    const report = await getGeneralLedger(session.school, query);
    return ok(report);
  })
);
