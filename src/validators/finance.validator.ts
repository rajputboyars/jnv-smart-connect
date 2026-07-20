import { z } from "zod";
import {
  FEE_FREQUENCIES,
  SCHOLARSHIP_TYPES,
  PAYMENT_METHODS,
  REFUND_STATUSES,
} from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

// --- Fee categories & structure ---

export const createFeeCategorySchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  code: z.string().trim().min(2, "Code is required"),
  frequency: z.enum(FEE_FREQUENCIES),
  description: z.string().trim().max(300).optional().or(z.literal("")),
});
export type CreateFeeCategoryInput = z.infer<typeof createFeeCategorySchema>;
export const updateFeeCategorySchema = createFeeCategorySchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateFeeCategoryInput = z.infer<typeof updateFeeCategorySchema>;

export const createFeeStructureSchema = z.object({
  academicYear: objectId,
  class: objectId,
  feeCategory: objectId,
  amount: z.number().min(0),
  installments: z.number().min(1).max(12),
  dueDate: z.string().min(1, "Due date is required"),
  lateFeePerDay: z.number().min(0),
  maxLateFee: z.number().min(0),
});
export type CreateFeeStructureInput = z.infer<typeof createFeeStructureSchema>;
export const updateFeeStructureSchema = createFeeStructureSchema.partial();
export type UpdateFeeStructureInput = z.infer<typeof updateFeeStructureSchema>;

// --- Scholarships & waivers ---

const scholarshipFields = {
  name: z.string().trim().min(2, "Name is required"),
  type: z.enum(SCHOLARSHIP_TYPES),
  value: z.number().min(0),
  criteria: z.string().trim().max(500).optional().or(z.literal("")),
};

// A percentage scholarship above 100% would drive an invoice's net payable
// negative (auto-marking it "paid" and corrupting receivable/report totals),
// so cap it. Fixed-amount scholarships are clamped to the fee at generation time.
const capPercentage = (
  data: { type?: string; value?: number },
  ctx: z.RefinementCtx
) => {
  if (data.type === "percentage" && typeof data.value === "number" && data.value > 100) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ["value"],
      message: "A percentage scholarship can't exceed 100%",
    });
  }
};

export const createScholarshipSchema = z.object(scholarshipFields).superRefine(capPercentage);
export type CreateScholarshipInput = z.infer<typeof createScholarshipSchema>;
export const updateScholarshipSchema = z
  .object(scholarshipFields)
  .partial()
  .extend({ isActive: z.boolean().optional() })
  .superRefine(capPercentage);
export type UpdateScholarshipInput = z.infer<typeof updateScholarshipSchema>;

export const assignScholarshipSchema = z.object({
  student: objectId,
  scholarship: objectId,
  academicYear: objectId,
  remarks: z.string().trim().max(500).optional().or(z.literal("")),
});
export type AssignScholarshipInput = z.infer<typeof assignScholarshipSchema>;

export const createFeeWaiverSchema = z.object({
  invoice: objectId,
  amount: z.number().min(0.01),
  reason: z.string().trim().min(3, "Reason is required").max(500),
});
export type CreateFeeWaiverInput = z.infer<typeof createFeeWaiverSchema>;

// --- Invoices & payments ---

export const generateInvoicesSchema = z.object({
  feeStructure: objectId,
});
export type GenerateInvoicesInput = z.infer<typeof generateInvoicesSchema>;

export const invoiceQuerySchema = z.object({
  page: z.number().min(1),
  limit: z.number().min(1).max(100),
  status: z.string().optional(),
  classId: objectId.optional().or(z.literal("")),
  studentId: objectId.optional().or(z.literal("")),
  search: z.string().trim().optional(),
});
export type InvoiceQueryInput = z.infer<typeof invoiceQuerySchema>;

export const recordPaymentSchema = z.object({
  invoice: objectId,
  amount: z.number().min(0.01),
  method: z.enum(PAYMENT_METHODS),
  transactionRef: z.string().trim().max(100).optional().or(z.literal("")),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type RecordPaymentInput = z.infer<typeof recordPaymentSchema>;

export const createRefundSchema = z.object({
  payment: objectId,
  amount: z.number().min(0.01),
  reason: z.string().trim().min(3, "Reason is required").max(500),
});
export type CreateRefundInput = z.infer<typeof createRefundSchema>;

export const reviewRefundSchema = z.object({
  status: z.enum(REFUND_STATUSES),
});
export type ReviewRefundInput = z.infer<typeof reviewRefundSchema>;

// --- Income, donations, expenses, vendors ---

export const createIncomeSchema = z.object({
  category: z.string().trim().min(2, "Category is required"),
  description: z.string().trim().min(3, "Description is required").max(500),
  amount: z.number().min(0.01),
  date: z.string().min(1, "Date is required"),
  source: z.string().trim().max(200).optional().or(z.literal("")),
});
export type CreateIncomeInput = z.infer<typeof createIncomeSchema>;

export const createDonationSchema = z.object({
  donorName: z.string().trim().min(2, "Donor name is required"),
  donorContact: z.string().trim().max(100).optional().or(z.literal("")),
  donorPan: z.string().trim().max(20).optional().or(z.literal("")),
  amount: z.number().min(0.01),
  purpose: z.string().trim().max(300).optional().or(z.literal("")),
  date: z.string().min(1, "Date is required"),
});
export type CreateDonationInput = z.infer<typeof createDonationSchema>;

export const createExpenseSchema = z.object({
  category: z.string().trim().min(2, "Category is required"),
  vendor: objectId.optional().or(z.literal("")),
  description: z.string().trim().min(3, "Description is required").max(500),
  amount: z.number().min(0.01),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  billReference: z.string().trim().max(100).optional().or(z.literal("")),
});
export type CreateExpenseInput = z.infer<typeof createExpenseSchema>;

export const createVendorSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  category: z.string().trim().min(2, "Category is required"),
  contactPerson: z.string().trim().max(100).optional().or(z.literal("")),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  email: z.string().trim().email("Enter a valid email").optional().or(z.literal("")),
  address: z.string().trim().max(300).optional().or(z.literal("")),
  gstNumber: z.string().trim().max(20).optional().or(z.literal("")),
});
export type CreateVendorInput = z.infer<typeof createVendorSchema>;
export const updateVendorSchema = createVendorSchema.partial().extend({
  isActive: z.boolean().optional(),
});
export type UpdateVendorInput = z.infer<typeof updateVendorSchema>;

export const createVendorPaymentSchema = z.object({
  vendor: objectId,
  amount: z.number().min(0.01),
  purpose: z.string().trim().min(3, "Purpose is required").max(300),
  date: z.string().min(1, "Date is required"),
  paymentMethod: z.enum(PAYMENT_METHODS),
  reference: z.string().trim().max(100).optional().or(z.literal("")),
});
export type CreateVendorPaymentInput = z.infer<typeof createVendorPaymentSchema>;

export const createBudgetSchema = z.object({
  academicYear: objectId,
  category: z.string().trim().min(2, "Category is required"),
  allocatedAmount: z.number().min(0),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreateBudgetInput = z.infer<typeof createBudgetSchema>;
export const updateBudgetSchema = createBudgetSchema.partial();
export type UpdateBudgetInput = z.infer<typeof updateBudgetSchema>;

// --- Reports ---

export const financeReportQuerySchema = z.object({
  from: z.string().min(1, "From date is required"),
  to: z.string().min(1, "To date is required"),
});
export type FinanceReportQueryInput = z.infer<typeof financeReportQuerySchema>;
