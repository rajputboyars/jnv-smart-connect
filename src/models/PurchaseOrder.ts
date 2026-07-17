import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { PURCHASE_ORDER_STATUSES, type PurchaseOrderStatus } from "./enums";

export interface IPurchaseOrderItem {
  description: string;
  quantity: number;
  unitPrice: number;
}

export interface IPurchaseOrder extends Document {
  _id: Types.ObjectId;
  poNumber: string;
  vendor: Types.ObjectId;
  items: IPurchaseOrderItem[];
  totalAmount: number;
  status: PurchaseOrderStatus;
  orderDate: Date;
  expectedDate?: Date;
  receivedDate?: Date;
  createdBy: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const purchaseOrderItemSchema = new Schema<IPurchaseOrderItem>(
  {
    description: { type: String, required: true, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    unitPrice: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const purchaseOrderSchema = new Schema<IPurchaseOrder>(
  {
    poNumber: { type: String, required: true, trim: true, uppercase: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    items: { type: [purchaseOrderItemSchema], required: true, validate: (v: unknown[]) => v.length > 0 },
    totalAmount: { type: Number, required: true, min: 0 },
    status: { type: String, enum: PURCHASE_ORDER_STATUSES, default: "draft" },
    orderDate: { type: Date, required: true, default: () => new Date() },
    expectedDate: { type: Date },
    receivedDate: { type: Date },
    createdBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

purchaseOrderSchema.index({ school: 1, poNumber: 1 }, { unique: true });
purchaseOrderSchema.index({ school: 1, status: 1, orderDate: -1 });

export const PurchaseOrder: Model<IPurchaseOrder> =
  models.PurchaseOrder || model<IPurchaseOrder>("PurchaseOrder", purchaseOrderSchema);
