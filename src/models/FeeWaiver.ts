import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IFeeWaiver extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  student: Types.ObjectId;
  invoice: Types.ObjectId;
  amount: number;
  reason: string;
  approvedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const feeWaiverSchema = new Schema<IFeeWaiver>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    invoice: { type: Schema.Types.ObjectId, ref: "FeeInvoice", required: true },
    amount: { type: Number, required: true, min: 0.01 },
    reason: { type: String, required: true, trim: true, maxlength: 500 },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

feeWaiverSchema.index({ school: 1, createdAt: -1 });

export const FeeWaiver: Model<IFeeWaiver> =
  models.FeeWaiver || model<IFeeWaiver>("FeeWaiver", feeWaiverSchema);
