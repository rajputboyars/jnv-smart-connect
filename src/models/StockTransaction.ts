import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { STOCK_TRANSACTION_TYPES, type StockTransactionType } from "./enums";

export interface IStockTransaction extends Document {
  _id: Types.ObjectId;
  stockItem: Types.ObjectId;
  type: StockTransactionType;
  quantity: number;
  date: Date;
  performedBy: Types.ObjectId;
  reference?: string;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockTransactionSchema = new Schema<IStockTransaction>(
  {
    stockItem: { type: Schema.Types.ObjectId, ref: "StockItem", required: true, index: true },
    type: { type: String, enum: STOCK_TRANSACTION_TYPES, required: true },
    // Positive for purchase/adjustment-increase, positive-magnitude for
    // issue too — the controller interprets sign by `type`, this field
    // always stores the absolute quantity moved.
    quantity: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: () => new Date() },
    performedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    reference: { type: String, trim: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

stockTransactionSchema.index({ school: 1, date: -1 });

export const StockTransaction: Model<IStockTransaction> =
  models.StockTransaction || model<IStockTransaction>("StockTransaction", stockTransactionSchema);
