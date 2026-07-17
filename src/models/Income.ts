import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IIncome extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  category: string;
  description: string;
  amount: number;
  date: Date;
  source?: string;
  recordedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const incomeSchema = new Schema<IIncome>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    category: { type: String, required: true, trim: true },
    description: { type: String, required: true, trim: true, maxlength: 500 },
    amount: { type: Number, required: true, min: 0.01 },
    date: { type: Date, required: true, default: () => new Date() },
    source: { type: String, trim: true },
    recordedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

incomeSchema.index({ school: 1, date: -1 });
incomeSchema.index({ school: 1, category: 1 });

export const Income: Model<IIncome> = models.Income || model<IIncome>("Income", incomeSchema);
