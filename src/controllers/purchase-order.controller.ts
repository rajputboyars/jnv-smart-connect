import { connectDB } from "@/lib/db/connect";
import { PurchaseOrder } from "@/models/PurchaseOrder";
import { Vendor } from "@/models/Vendor";
import { ActivityLog } from "@/models/ActivityLog";
import { ApiError } from "@/lib/utils/api-error";
import { generateDocumentNumber } from "@/lib/utils/document-number";
import type { PurchaseOrderStatus } from "@/models/enums";
import type {
  CreatePurchaseOrderInput,
  UpdatePurchaseOrderStatusInput,
} from "@/validators/inventory.validator";

export async function listPurchaseOrders(school?: string, status?: PurchaseOrderStatus) {
  await connectDB();
  if (!school) return [];
  return PurchaseOrder.find({ school, ...(status ? { status } : {}) })
    .sort({ orderDate: -1 })
    .populate("vendor", "name")
    .populate("createdBy", "name")
    .lean();
}

export async function createPurchaseOrder(
  input: CreatePurchaseOrderInput,
  actor: { id: string; school?: string }
) {
  await connectDB();
  if (!actor.school) throw ApiError.badRequest("Your account is not linked to a school");

  const vendor = await Vendor.findOne({ _id: input.vendor, school: actor.school });
  if (!vendor) throw ApiError.badRequest("Vendor not found");

  const totalAmount = input.items.reduce((sum, item) => sum + item.quantity * item.unitPrice, 0);

  const order = await PurchaseOrder.create({
    poNumber: generateDocumentNumber("PO"),
    vendor: input.vendor,
    items: input.items,
    totalAmount,
    expectedDate: input.expectedDate ? new Date(input.expectedDate) : undefined,
    createdBy: actor.id,
    school: actor.school,
  });

  await ActivityLog.create({
    user: actor.id,
    action: "purchase_order.create",
    entityType: "PurchaseOrder",
    entityId: order._id,
    school: actor.school,
  });

  return order;
}

export async function updatePurchaseOrderStatus(
  id: string,
  input: UpdatePurchaseOrderStatusInput,
  actor: { id: string; school?: string }
) {
  await connectDB();

  const order = await PurchaseOrder.findOne({ _id: id, ...(actor.school ? { school: actor.school } : {}) });
  if (!order) throw ApiError.notFound("Purchase order not found");

  order.status = input.status;
  if (input.status === "received") order.receivedDate = new Date();
  await order.save();

  await ActivityLog.create({
    user: actor.id,
    action: "purchase_order.status_update",
    entityType: "PurchaseOrder",
    entityId: order._id,
    metadata: { status: input.status },
    school: actor.school,
  });

  return order;
}
