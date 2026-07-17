import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { INVENTORY_REQUEST_STATUSES, type InventoryRequestStatus } from "./enums";

export interface IInventoryRequest extends Document {
  _id: Types.ObjectId;
  requestedBy: Types.ObjectId;
  itemDescription: string;
  category?: string;
  quantity: number;
  purpose: string;
  status: InventoryRequestStatus;
  approvedBy?: Types.ObjectId;
  fulfilledAt?: Date;
  reviewNote?: string;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const inventoryRequestSchema = new Schema<IInventoryRequest>(
  {
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    itemDescription: { type: String, required: true, trim: true, maxlength: 300 },
    category: { type: String, trim: true },
    quantity: { type: Number, required: true, min: 1 },
    purpose: { type: String, required: true, trim: true, maxlength: 300 },
    status: { type: String, enum: INVENTORY_REQUEST_STATUSES, default: "pending" },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    fulfilledAt: { type: Date },
    reviewNote: { type: String, trim: true, maxlength: 500 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

inventoryRequestSchema.index({ school: 1, status: 1, createdAt: -1 });

export const InventoryRequest: Model<IInventoryRequest> =
  models.InventoryRequest || model<IInventoryRequest>("InventoryRequest", inventoryRequestSchema);
