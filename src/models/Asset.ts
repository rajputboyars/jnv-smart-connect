import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { ASSET_CONDITIONS, ASSET_STATUSES, type AssetCondition, type AssetStatus } from "./enums";

export interface IAsset extends Document {
  _id: Types.ObjectId;
  name: string;
  category: Types.ObjectId;
  tag: string;
  serialNumber?: string;
  location: string;
  purchaseDate: Date;
  purchaseCost: number;
  vendor?: Types.ObjectId;
  condition: AssetCondition;
  status: AssetStatus;
  depreciationRatePercent: number;
  warrantyExpiry?: Date;
  notes?: string;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assetSchema = new Schema<IAsset>(
  {
    name: { type: String, required: true, trim: true },
    category: { type: Schema.Types.ObjectId, ref: "AssetCategory", required: true, index: true },
    tag: { type: String, required: true, trim: true, uppercase: true },
    serialNumber: { type: String, trim: true },
    location: { type: String, required: true, trim: true },
    purchaseDate: { type: Date, required: true },
    purchaseCost: { type: Number, required: true, min: 0 },
    vendor: { type: Schema.Types.ObjectId, ref: "Vendor" },
    condition: { type: String, enum: ASSET_CONDITIONS, default: "new" },
    status: { type: String, enum: ASSET_STATUSES, default: "in_use" },
    depreciationRatePercent: { type: Number, default: 10, min: 0, max: 100 },
    warrantyExpiry: { type: Date },
    notes: { type: String, trim: true, maxlength: 500 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

assetSchema.index({ school: 1, tag: 1 }, { unique: true });
assetSchema.index({ school: 1, category: 1, status: 1 });
assetSchema.index({ name: "text", tag: "text", serialNumber: "text" });

export const Asset: Model<IAsset> = models.Asset || model<IAsset>("Asset", assetSchema);
