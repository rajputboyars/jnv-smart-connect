import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createPurchaseOrderSchema } from "@/validators/inventory.validator";
import { listPurchaseOrders, createPurchaseOrder } from "@/controllers/purchase-order.controller";
import { ok } from "@/lib/utils/api-response";
import type { PurchaseOrderStatus } from "@/models/enums";

export const GET = withErrorHandling(
  withPermission(PERMISSIONS.INVENTORY_MANAGE, async (req, _ctx, session) => {
    const status = (req.nextUrl.searchParams.get("status") as PurchaseOrderStatus) || undefined;
    const orders = await listPurchaseOrders(session.school, status);
    return ok(orders);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.INVENTORY_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createPurchaseOrderSchema.parse(body);
    const order = await createPurchaseOrder(input, { id: session.sub, school: session.school });
    return ok({ id: order._id.toString(), poNumber: order.poNumber }, { status: 201, message: "Purchase order created" });
  })
);
