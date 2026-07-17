import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IAssetTransfer extends Document {
  _id: Types.ObjectId;
  asset: Types.ObjectId;
  fromLocation: string;
  toLocation: string;
  transferredBy: Types.ObjectId;
  date: Date;
  reason?: string;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const assetTransferSchema = new Schema<IAssetTransfer>(
  {
    asset: { type: Schema.Types.ObjectId, ref: "Asset", required: true, index: true },
    fromLocation: { type: String, required: true, trim: true },
    toLocation: { type: String, required: true, trim: true },
    transferredBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    date: { type: Date, required: true, default: () => new Date() },
    reason: { type: String, trim: true, maxlength: 300 },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

assetTransferSchema.index({ school: 1, date: -1 });

export const AssetTransfer: Model<IAssetTransfer> =
  models.AssetTransfer || model<IAssetTransfer>("AssetTransfer", assetTransferSchema);
