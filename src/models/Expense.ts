import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { PAYMENT_METHODS, type PaymentMethod } from "./enums";

export interface IExpense extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  category: string;
  vendor?: Types.ObjectId;
  description: string;
  amount: number;
  date: Date;
  paymentMethod: PaymentMethod;
  billReference?: string;
  approvedBy: Types.ObjectId;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const expenseSchema = new Schema<IExpense>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    category: { type: String, required: true, trim: true },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: () => new Date() },
    paymentMethod: { type: String, enum: PAYMENT_METHODS, default: "cash" },
    billReference: { type: String, trim: true },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

expenseSchema.index({ school: 1, date: -1 });
expenseSchema.index({ school: 1, category: 1 });

export const Expense: Model<IExpense> = models.Expense || model<IExpense>("Expense", expenseSchema);
