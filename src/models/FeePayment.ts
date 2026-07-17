import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { PAYMENT_METHODS, type PaymentMethod } from "./enums";

export interface IPaymentGatewayInfo {
  provider?: string;
  orderId?: string;
  paymentId?: string;
  status?: string;
}

export interface IFeePayment extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  invoice: Types.ObjectId;
  student: Types.ObjectId;
  amount: number;
  method: PaymentMethod;
  transactionRef?: string;
  gateway?: IPaymentGatewayInfo;
  receiptNumber: string;
  receivedBy: Types.ObjectId;
  paidAt: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const paymentGatewaySchema = new Schema<IPaymentGatewayInfo>(
  {
    provider: { type: String, trim: true },
    orderId: { type: String, trim: true },
    paymentId: { type: String, trim: true },
    status: { type: String, trim: true },
  },
  { _id: false }
);

const feePaymentSchema = new Schema<IFeePayment>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    invoice: { type: Schema.Types.ObjectId, ref: "FeeInvoice", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    amount: { type: Number, required: true, min: 0.01 },
    method: { type: String, enum: PAYMENT_METHODS, required: true },
    transactionRef: { type: String, trim: true },
    // Provider/orderId/paymentId/status are populated once a real payment
    // gateway (Razorpay/Stripe/etc.) is wired in — see docs/ROADMAP.md. Until
    // then, `method: "online"` payments are still recorded here manually by
    // an accountant reconciling a bank statement.
    gateway: paymentGatewaySchema,
    receiptNumber: { type: String, required: true, trim: true, uppercase: true },
    receivedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    paidAt: { type: Date, default: () => new Date() },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

feePaymentSchema.index({ school: 1, receiptNumber: 1 }, { unique: true });
feePaymentSchema.index({ school: 1, paidAt: -1 });

export const FeePayment: Model<IFeePayment> =
  models.FeePayment || model<IFeePayment>("FeePayment", feePaymentSchema);
