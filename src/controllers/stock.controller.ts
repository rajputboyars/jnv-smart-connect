import { connectDB } from "@/lib/db/connect";
import { StockItem } from "@/models/StockItem";
import { StockTransaction } from "@/models/StockTransaction";
import { Notification } from "@/models/Notification";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { ROLES } from "@/types/roles";
import type {
  CreateStockItemInput,
  UpdateStockItemInput,
  CreateStockTransactionInput,
} from "@/validators/inventory.validator";

export async function listStockItems(school?: string) {
  await connectDB();
  if (!school) return [];
  return StockItem.find({ school }).sort({ name: 1 }).lean();
}

export async function createStockItem(input: CreateStockItemInput, actor: { id: string; school?: string }) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const existing = await StockItem.findOne({ school: actor.school, name: input.name });
  if (existing) throw ApiError.conflict("A stock item with this name already exists");

  const item = await StockItem.create({ ...input, school: actor.school });

  await ActivityLog.create({
    user: actor.id,
    action: "stock_item.create",
    entityType: "StockItem",
    entityId: item._id,
    school: actor.school,
  });

  return item;
}

export async function updateStockItem(
  id: string,
  input: UpdateStockItemInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const item = await StockItem.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!item) throw ApiError.notFound("Stock item not found");

  Object.assign(item, input);
  await item.save();

  await ActivityLog.create({
    user: actor.id,
    action: "stock_item.update",
    entityType: "StockItem",
    entityId: item._id,
    school: actor.school,
  });

  return item;
}

export async function listStockTransactions(school?: string, stockItemId?: string) {
  await connectDB();
  if (!school) return [];
  return StockTransaction.find({ school, ...(stockItemId ? { stockItem: stockItemId } : {}) })
    .sort({ date: -1 })
    .limit(200)
    .populate("stockItem", "name unit")
    .populate("performedBy", "name")
    .lean();
}

export async function recordStockTransaction(
  input: CreateStockTransactionInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const item = await StockItem.findOne({ _id: input.stockItem, school: actor.school });
  if (!item) throw ApiError.notFound("Stock item not found");

  if (input.type === "purchase") {
    item.quantityInStock += input.quantity;
  } else if (input.type === "issue") {
    if (input.quantity > item.quantityInStock) {
      throw ApiError.badRequest(`Only ${item.quantityInStock} ${item.unit}(s) of ${item.name} in stock`);
    }
    item.quantityInStock -= input.quantity;
  } else {
    // Adjustment: a physical stock count correcting the recorded quantity
    // to the counted value (not a delta) — the standard meaning of a stock
    // "adjustment" transaction.
    item.quantityInStock = input.quantity;
  }
  await item.save();

  const transaction = await StockTransaction.create({
    stockItem: item._id,
    type: input.type,
    quantity: input.quantity,
    performedBy: actor.id,
    reference: input.reference || undefined,
    school: actor.school,
  });

  if (item.quantityInStock <= item.reorderLevel) {
    await Notification.create({
      title: `Low stock: ${item.name}`,
      message: `${item.name} is at ${item.quantityInStock} ${item.unit}(s), at or below the reorder level of ${item.reorderLevel}.`,
      type: "warning",
      audienceScope: "roles",
      audienceRoles: [ROLES.SUPER_ADMIN, ROLES.PRINCIPAL],
      sender: actor.id,
      school: actor.school,
    });
  }

  await ActivityLog.create({
    user: actor.id,
    action: "stock_transaction.create",
    entityType: "StockTransaction",
    entityId: transaction._id,
    metadata: { stockItem: item._id.toString(), type: input.type, quantity: input.quantity },
    school: actor.school,
  });

  return { transaction, currentStock: item.quantityInStock };
}
