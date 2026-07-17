import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { recordPaymentSchema } from "@/validators/finance.validator";
import { recordPayment } from "@/controllers/fee-invoice.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = recordPaymentSchema.parse({ ...body, invoice: id });
    const result = await recordPayment(input, { id: session.sub, school: session.school });
    return ok(
      { id: result.payment._id.toString(), receiptNumber: result.payment.receiptNumber },
      { status: 201, message: "Payment recorded" }
    );
  })
);
