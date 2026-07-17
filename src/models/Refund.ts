import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { REFUND_STATUSES, type RefundStatus } from "./enums";

export interface IRefund extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  payment: Types.ObjectId;
  student: Types.ObjectId;
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedBy: Types.ObjectId;
  approvedBy?: Types.ObjectId;
  processedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refundSchema = new Schema<IRefund>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    payment: { type: Schema.Types.ObjectId, ref: "FeePayment", required: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    status: { type: String, enum: REFUND_STATUSES, default: "pending" },
    requestedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User" },
    processedAt: { type: Date },
  },
  { timestamps: true }
);

refundSchema.index({ school: 1, status: 1, createdAt: -1 });

export const Refund: Model<IRefund> = models.Refund || model<IRefund>("Refund", refundSchema);
