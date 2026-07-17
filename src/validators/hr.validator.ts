import { z } from "zod";
import {
  STAFF_LEAVE_TYPES,
  LEAVE_REQUEST_STATUSES,
  EMPLOYEE_DOCUMENT_TYPES,
  PAYSLIP_STATUSES,
} from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createStaffLeaveRequestSchema = z.object({
  leaveType: z.enum(STAFF_LEAVE_TYPES),
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  reason: z.string().trim().min(3, "Reason is required").max(500),
});
export type CreateStaffLeaveRequestInput = z.infer<typeof createStaffLeaveRequestSchema>;

export const reviewStaffLeaveRequestSchema = z.object({
  status: z.enum(LEAVE_REQUEST_STATUSES),
  reviewNote: z.string().trim().max(500).optional().or(z.literal("")),
});
export type ReviewStaffLeaveRequestInput = z.infer<typeof reviewStaffLeaveRequestSchema>;

const salaryComponentSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  amount: z.number().min(0),
});

export const createSalaryStructureSchema = z.object({
  teacher: objectId,
  basicPay: z.number().min(0),
  allowances: z.array(salaryComponentSchema).default([]),
  deductions: z.array(salaryComponentSchema).default([]),
  effectiveFrom: z.string().min(1, "Effective date is required"),
});
export type CreateSalaryStructureInput = z.infer<typeof createSalaryStructureSchema>;

export const generatePayslipSchema = z.object({
  teacher: objectId,
  month: z.number().min(1).max(12),
  year: z.number().min(2000),
});
export type GeneratePayslipInput = z.infer<typeof generatePayslipSchema>;

export const updatePayslipStatusSchema = z.object({
  status: z.enum(PAYSLIP_STATUSES),
});
export type UpdatePayslipStatusInput = z.infer<typeof updatePayslipStatusSchema>;

export const createPromotionHistorySchema = z.object({
  teacher: objectId,
  fromDesignation: z.string().trim().min(1, "Current designation is required"),
  toDesignation: z.string().trim().min(1, "New designation is required"),
  effectiveDate: z.string().min(1, "Effective date is required"),
  remarks: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreatePromotionHistoryInput = z.infer<typeof createPromotionHistorySchema>;

export const createEmployeeDocumentSchema = z.object({
  teacher: objectId,
  docType: z.enum(EMPLOYEE_DOCUMENT_TYPES),
  fileUrl: z.string().trim().min(1, "File URL is required"),
  fileName: z.string().trim().min(1, "File name is required"),
});
export type CreateEmployeeDocumentInput = z.infer<typeof createEmployeeDocumentSchema>;

export const createPerformanceReviewSchema = z.object({
  teacher: objectId,
  academicYear: objectId,
  rating: z.number().min(1).max(5),
  strengths: z.string().trim().max(1000).optional().or(z.literal("")),
  areasOfImprovement: z.string().trim().max(1000).optional().or(z.literal("")),
  goals: z.string().trim().max(1000).optional().or(z.literal("")),
  reviewDate: z.string().min(1, "Review date is required"),
});
export type CreatePerformanceReviewInput = z.infer<typeof createPerformanceReviewSchema>;
