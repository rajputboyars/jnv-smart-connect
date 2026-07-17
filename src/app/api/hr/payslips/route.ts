import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { generatePayslipSchema } from "@/validators/hr.validator";
import { listPayslips, generatePayslip } from "@/controllers/payroll.controller";
import { ok } from "@/lib/utils/api-response";

const PAYSLIP_PERMISSIONS = [PERMISSIONS.HR_VIEW, PERMISSIONS.HR_MANAGE];

export const GET = withErrorHandling(
  withAnyPermission(PAYSLIP_PERMISSIONS, async (req, _ctx, session) => {
    const teacher = req.nextUrl.searchParams.get("teacher") ?? undefined;
    const month = req.nextUrl.searchParams.get("month");
    const year = req.nextUrl.searchParams.get("year");
    const payslips = await listPayslips(session, {
      teacher,
      month: month ? Number(month) : undefined,
      year: year ? Number(year) : undefined,
    });
    return ok(payslips);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.HR_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = generatePayslipSchema.parse(body);
    const payslip = await generatePayslip(input, { id: session.sub, school: session.school });
    return ok({ id: payslip._id.toString() }, { status: 201, message: "Payslip generated" });
  })
);
