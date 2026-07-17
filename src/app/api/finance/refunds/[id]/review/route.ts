import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { reviewRefundSchema } from "@/validators/finance.validator";
import { reviewRefund } from "@/controllers/fee-invoice.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = reviewRefundSchema.parse(body);
    const refund = await reviewRefund(id, input, { id: session.sub, school: session.school });
    return ok({ id: refund._id.toString(), status: refund.status }, { message: "Refund updated" });
  })
);
