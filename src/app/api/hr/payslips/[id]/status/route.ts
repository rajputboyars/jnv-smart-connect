import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updatePayslipStatusSchema } from "@/validators/hr.validator";
import { updatePayslipStatus } from "@/controllers/payroll.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.HR_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updatePayslipStatusSchema.parse(body);
    const payslip = await updatePayslipStatus(id, input, { id: session.sub, school: session.school });
    return ok({ id: payslip._id.toString(), status: payslip.status }, { message: "Payslip updated" });
  })
);
