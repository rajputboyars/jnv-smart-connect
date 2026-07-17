import { Schema, model, models, type Document, type Model, Types } from "mongoose";
import { FEE_INVOICE_STATUSES, type FeeInvoiceStatus } from "./enums";

export interface IFeeInvoice extends Document {
  _id: Types.ObjectId;
  school: Types.ObjectId;
  student: Types.ObjectId;
  academicYear: Types.ObjectId;
  feeCategory: Types.ObjectId;
  feeStructure: Types.ObjectId;
  installmentNumber: number;
  totalInstallments: number;
  invoiceNumber: string;
  amount: number;
  discountAmount: number;
  waiverAmount: number;
  lateFeeAmount: number;
  paidAmount: number;
  dueDate: Date;
  status: FeeInvoiceStatus;
  generatedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const feeInvoiceSchema = new Schema<IFeeInvoice>(
  {
    school: { type: Schema.Types.ObjectId, ref: "School", required: true, index: true },
    student: { type: Schema.Types.ObjectId, ref: "Student", required: true, index: true },
    academicYear: { type: Schema.Types.ObjectId, ref: "AcademicYear", required: true },
    feeCategory: { type: Schema.Types.ObjectId, ref: "FeeCategory", required: true },
    feeStructure: { type: Schema.Types.ObjectId, ref: "FeeStructure", required: true },
    installmentNumber: { type: Number, required: true, min: 1 },
    totalInstallments: { type: Number, required: true, min: 1 },
    invoiceNumber: { type: String, required: true, trim: true, uppercase: true },
    amount: { type: Number, required: true, min: 0 },
    discountAmount: { type: Number, default: 0, min: 0 },
    waiverAmount: { type: Number, default: 0, min: 0 },
    lateFeeAmount: { type: Number, default: 0, min: 0 },
    paidAmount: { type: Number, default: 0, min: 0 },
    dueDate: { type: Date, required: true },
    status: { type: String, enum: FEE_INVOICE_STATUSES, default: "pending" },
    generatedBy: { type: Schema.Types.ObjectId, ref: "User", required: true },
  },
  { timestamps: true }
);

feeInvoiceSchema.index({ school: 1, invoiceNumber: 1 }, { unique: true });
feeInvoiceSchema.index({ student: 1, feeStructure: 1, installmentNumber: 1 }, { unique: true });
feeInvoiceSchema.index({ school: 1, status: 1, dueDate: 1 });

export const FeeInvoice: Model<IFeeInvoice> =
  models.FeeInvoice || model<IFeeInvoice>("FeeInvoice", feeInvoiceSchema);
