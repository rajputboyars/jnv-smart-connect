import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { STOCK_UNITS, type StockUnit } from "./enums";

export interface IStockItem extends Document {
  _id: Types.ObjectId;
  name: string;
  category: string;
  unit: StockUnit;
  quantityInStock: number;
  reorderLevel: number;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const stockItemSchema = new Schema<IStockItem>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: String, required: true, trim: true },
    unit: { type: String, enum: STOCK_UNITS, default: "piece" },
    quantityInStock: { type: Number, default: 0, min: 0 },
    reorderLevel: { type: Number, default: 0, min: 0 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

stockItemSchema.index({ school: 1, name: 1 }, { unique: true });

export const StockItem: Model<IStockItem> =
  models.StockItem || model<IStockItem>("StockItem", stockItemSchema);
