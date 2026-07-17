import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IBudget extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  academicYear: Types.ObjectId;
  category: string;
  allocatedAmount: number;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const budgetSchema = new Schema<IBudget>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true, index: true },
    category: { type: String, required: true, trim: true },
    allocatedAmount: { type: Number, required: true, min: 0 },
    notes: { type: String, trim: true, maxlength: 500 },
  },
  { timestamps: true }
);

budgetSchema.index({ school: 1, academicYear: 1, category: 1 }, { unique: true });

export const Budget: Model<IBudget> = models.Budget || model<IBudget>("Budget", budgetSchema);
