import { withErrorHandling } from "@/middlewares/error-handler";
import { withAnyPermission, withPermission } from "@/middlewares/with-auth";
import { PERMISSIONS } from "@/lib/auth/rbac";
import { createStockTransactionSchema } from "@/validators/inventory.validator";
import { listStockTransactions, recordStockTransaction } from "@/controllers/stock.controller";
import { ok } from "@/lib/utils/api-response";

export const GET = withErrorHandling(
  withAnyPermission([PERMISSIONS.INVENTORY_VIEW, PERMISSIONS.INVENTORY_MANAGE], async (req, _ctx, session) => {
    const stockItemId = req.nextUrl.searchParams.get("stockItemId") ?? undefined;
    const transactions = await listStockTransactions(session.school, stockItemId);
    return ok(transactions);
  })
);

export const POST = withErrorHandling(
  withPermission(PERMISSIONS.INVENTORY_MANAGE, async (req, _ctx, session) => {
    const body = await req.json();
    const input = createStockTransactionSchema.parse(body);
    const result = await recordStockTransaction(input, { id: session.sub, school: session.school });
    return ok(
      { id: result.transaction._id.toString(), currentStock: result.currentStock },
      { status: 201, message: "Stock transaction recorded" }
    );
  })
);
