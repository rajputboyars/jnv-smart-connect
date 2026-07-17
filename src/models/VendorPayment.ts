import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { PAYMENT_METHODS, type PaymentMethod } from "./enums";

export interface IVendorPayment extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  vendor: Types.ObjectId;
  amount: number;
  purpose: string;
  date: Date;
  paymentMethod: PaymentMethod;
  reference?: string;
  approvedBy: Types.ObjectId;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const vendorPaymentSchema = new Schema<IVendorPayment>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    purpose: { type: String, required: true, trim: true, maxlength: 300 },
    date: { type: Date, required: true, default: () => new Date() },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "bank_transfer" },
    reference: { type: String, trim: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

vendorPaymentSchema.index({ school: 1, date: -1 });

export const VendorPayment: Model<IVendorPayment> =
  models.VendorPayment || model<IVendorPayment>("VendorPayment", vendorPaymentSchema);
