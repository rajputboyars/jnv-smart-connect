import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updatePurchaseOrderStatusSchema } from "@/validators/inventory.validator";
import { updatePurchaseOrderStatus } from "@/controllers/purchase-order.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const POST = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.INVENTORY_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updatePurchaseOrderStatusSchema.parse(body);
    const order = await updatePurchaseOrderStatus(id, input, { id: session.sub, school: session.school });
    return ok({ id: order._id.toString(), status: order.status }, { message: "Purchase order updated" });
  })
);
