import { Schema, model, models, type Document, type Model, Types } from "mongoose";

export interface ISalaryComponent {
  name: string;
  amount: number;
}

export interface ISalaryStructure extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  basicPay: number;
  allowances: ISalaryComponent[];
  deductions: ISalaryComponent[];
  effectiveFrom: Date;
  school: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const salaryComponentSchema = new Schema<ISalaryComponent>(
  {
    name: { type: String, required: true, trim: true },
    amount: { type: Number, required: true, min: 0 },
  },
  { _id: false }
);

const salaryStructureSchema = new Schema<ISalaryStructure>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    basicPay: { type: Number, required: true, min: 0 },
    allowances: [salaryComponentSchema],
    deductions: [salaryComponentSchema],
    effectiveFrom: { type: Date, required: true },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

salaryStructureSchema.index({ school: 1, teacher: 1, effectiveFrom: -1 });

export const SalaryStructure: Model<ISalaryStructure> =
  models.SalaryStructure || model<ISalaryStructure>("SalaryStructure", salaryStructureSchema);
