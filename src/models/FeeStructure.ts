import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface IFeeStructure extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  academicYear: Types.ObjectId;
  class: Types.ObjectId;
  feeCategory: Types.ObjectId;
  amount: number;
  installments: number;
  dueDate: Date;
  lateFeePerDay: number;
  maxLateFee: number;
  createdAt: Date;
  updatedAt: Date;
}

const feeStructureSchema = new Schema<IFeeStructure>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true, index: true },
    class: { type: Schema.Types.ObjectId, ref: "Class", required: true, index: true },
    feeCategory: { type: Schema.Types.ObjectId, ref: "FeeCategory", required: true },
    amount: { type: Number, required: true, min: 0 },
    installments: { type: Number, default: 1, min: 1, max: 12 },
    dueDate: { type: Date, required: true },
    lateFeePerDay: { type: Number, default: 0, min: 0 },
    maxLateFee: { type: Number, default: 0, min: 0 },
  },
  { timestamps: true }
);

feeStructureSchema.index({ school: 1, academicYear: 1, class: 1, feeCategory: 1 }, { unique: true });

export const FeeStructure: Model<IFeeStructure> =
  models.FeeStructure || model<IFeeStructure>("FeeStructure", feeStructureSchema);
