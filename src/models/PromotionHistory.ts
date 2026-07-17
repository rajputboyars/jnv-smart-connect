import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IPromotionHistory extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  fromDesignation: string;
  toDesignation: string;
  effectiveDate: Date;
  remarks?: string;
  approvedBy: Types.ObjectId;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const promotionHistorySchema = new Schema<IPromotionHistory>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    fromDesignation: { type: String, required: true, trim: true },
    toDesignation: { type: String, required: true, trim: true },
    effectiveDate: { type: Date, required: true },
    remarks: { type: String, trim: true, maxlength: 500 },
    approvedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

promotionHistorySchema.index({ school: 1, teacher: 1, effectiveDate: -1 });

export const PromotionHistory: Model<IPromotionHistory> =
  models.PromotionHistory || model<IPromotionHistory>("PromotionHistory", promotionHistorySchema);
