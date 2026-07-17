import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createStockItemSchema } from "@/validators/inventory.validator";
import { listStockItems, createStockItem } from "@/controllers/stock.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAnyPermission([PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE], async (_req, _ctx, session) => {
    const items = await listStockItems(session.school);
    return ok(items);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.INVENTORY_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createStockItemSchema.parse(body);
    const item = await createStockItem(input, { id: session.sub, school: session.school });
    return ok({ id: item._id.toString() }, { status: 201, message: "Stock item added" });
  })
);
