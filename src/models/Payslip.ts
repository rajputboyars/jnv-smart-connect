import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { PAYSLIP_STATUSES, type PayslipStatus } from "./enums";
import type { ISalaryComponent } from "./SalaryStructure";

export interface IPayslip extends Document {
  _id: Types.ObjectId;
  teacher: Types.ObjectId;
  month: number;
  year: number;
  basicPay: number;
  allowances: ISalaryComponent[];
  deductions: ISalaryComponent[];
  grossPay: number;
  netPay: number;
  status: PayslipStatus;
  generatedAt?: Date;
  generatedBy?: Types.ObjectId;
  paidAt?: Date;
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

const payslipSchema = new Schema<IPayslip>(
  {
    teacher: { type: Schema.Types.ObjectId, ref: "Teacher", required: true, index: true },
    month: { type: Number, required: true, min: 1, max: 12 },
    year: { type: Number, required: true, min: 2000 },
    basicPay: { type: Number, required: true, min: 0 },
    allowances: [salaryComponentSchema],
    deductions: [salaryComponentSchema],
    grossPay: { type: Number, required: true, min: 0 },
    netPay: { type: Number, required: true, min: 0 },
    status: { type: String, enum: PAYSLIP_STATUSES, default: "draft" },
    generatedAt: { type: Date },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User" },
    paidAt: { type: Date },
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
  },
  { timestamps: true }
);

payslipSchema.index({ school: 1, teacher: 1, month: 1, year: 1 }, { unique: true });
payslipSchema.index({ school: 1, year: 1, month: 1 });

export const Payslip: Model<IPayslip> = models.Payslip || model<IPayslip>("Payslip", payslipSchema);
