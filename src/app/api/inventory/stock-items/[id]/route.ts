import { withErrorHandling } from "@/middlewares/error-handler";
import { withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { updateStockItemSchema } from "@/validators/inventory.validator";
import { updateStockItem } from "@/controllers/stock.controller";
import { ok } from "@/lib/utils/api-response";

type Ctx = { params: Promise<{ id: string }> };

export const PATCH = withErrorHandling<Ctx>(
  withPermission<Ctx>(PERMISSIONS.INVENTORY_MANAGE, async (req, ctx, session) => {
    const { id } = await ctx.params;
    const body = await req.json();
    const input = updateStockItemSchema.parse(body);
    const item = await updateStockItem(id, input, { id: session.sub, school: session.school });
    return ok({ id: item._id.toString() }, { message: "Stock item updated" });
  })
);
