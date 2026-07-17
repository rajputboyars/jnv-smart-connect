import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createFeeWaiverSchema } from "@/validators/finance.validator";
import { createWaiver } from "@/controllers/fee-invoice.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.ACCOUNTS_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = createFeeWaiverSchema.parse({ ...body, invoice: id });
    const waiver = await createWaiver(input, { id: session.sub, school: session.school });
    return ok({ id: waiver._id.toString() }, { status: 201, message: "Waiver applied" });
  })
);
