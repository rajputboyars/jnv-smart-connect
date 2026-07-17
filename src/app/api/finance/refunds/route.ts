import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createRefundSchema } from "@/validators/finance.validator";
import { listRefunds, createRefund } from "@/controllers/fee-invoice.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (_req, _ctx, session) => {
    const refunds = await listRefunds(session.school);
    return ok(refunds);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.ACCOUNTS_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createRefundSchema.parse(body);
    const refund = await createRefund(input, { id: session.sub, school: session.school });
    return ok({ id: refund._id.toString() }, { status: 201, message: "Refund requested" });
  })
);
