import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { ASSET_CATEGORY_TYPES, type AssetCategoryType } from "./enums";

export interface IAssetCategory extends Document {
  _id: Types.ObjectId;
  name: string;
  type: AssetCategoryType;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assetCategorySchema = new Schema<IAssetCategory>(
  {
    name: { type: String, required: true, trim: true },
    type: { type: String, enum: ASSET_CATEGORY_TYPES, required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

assetCategorySchema.index({ school: 1, name: 1 }, { unique: true });

export const AssetCategory: Model<IAssetCategory> =
  models.AssetCategory || model<IAssetCategory>("AssetCategory", assetCategorySchema);
