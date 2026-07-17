import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { FEE_FREQUENCIES, type FeeFrequency } from "./enums";

export interface IFeeCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  code: string;
  frequency: FeeFrequency;
  description?: string;
  isActive: boolean;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const feeCategorySchema = new Schema<IFeeCategory>(
  {
    name: { type: String, required: true, trim: true },
    code: { type: String, required: true, trim: true, uppercase: true },
    frequency: { type: String, enum: FEE_FREQUENCIES, default: "annual" },
    description: { type: String, trim: true, maxlength: 300 },
    isActive: { type: Boolean, default: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

feeCategorySchema.index({ school: 1, code: 1 }, { unique: true });

export const FeeCategory: Model<IFeeCategory> =
  models.FeeCategory || model<IFeeCategory>("FeeCategory", feeCategorySchema);
