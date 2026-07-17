import { apiFetch } from "@/lib/api-client";
import type {
  StaffLeaveType,
  LeaveRequestStatus,
  PayslipStatus,
  EmployeeDocumentType,
} from "@/models/enums";

// --- Staff leave ---

export interface StaffLeaveRequestItem {
  _id: string;
  teacher: { _id: string; name: string; employeeId: string; designation?: string };
  leaveType: StaffLeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveRequestStatus;
  reviewedBy?: { name: string };
  reviewNote?: string;
  createdAt: string;
}
export async function fetchStaffLeaveRequests(status?: string) {
  const params = status ? `?status=${status}` : "";
  const res = await apiFetch<StaffLeaveRequestItem[]>(`/api/hr/leave-requests${params}`);
  return res.data ?? [];
}
export async function createStaffLeaveRequestRequest(input: {
  leaveType: StaffLeaveType;
  fromDate: string;
  toDate: string;
  reason: string;
}) {
  return apiFetch<{ id: string }>("/api/hr/leave-requests", { method: "POST", body: JSON.stringify(input) });
}
export async function reviewStaffLeaveRequestRequest(
  id: string,
  input: { status: LeaveRequestStatus; reviewNote?: string }
) {
  return apiFetch<{ id: string; status: LeaveRequestStatus }>(`/api/hr/leave-requests/${id}/review`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// --- Salary structures ---

export interface SalaryComponentDto {
  name: string;
  amount: number;
}
export interface SalaryStructureItem {
  _id: string;
  teacher: { _id: string; name: string; employeeId: string; designation?: string };
  basicPay: number;
  allowances: SalaryComponentDto[];
  deductions: SalaryComponentDto[];
  effectiveFrom: string;
}
export async function fetchSalaryStructures(teacher?: string) {
  const params = teacher ? `?teacher=${teacher}` : "";
  const res = await apiFetch<SalaryStructureItem[]>(`/api/hr/salary-structures${params}`);
  return res.data ?? [];
}
export async function createSalaryStructureRequest(input: {
  teacher: string;
  basicPay: number;
  allowances: SalaryComponentDto[];
  deductions: SalaryComponentDto[];
  effectiveFrom: string;
}) {
  return apiFetch<{ id: string }>("/api/hr/salary-structures", { method: "POST", body: JSON.stringify(input) });
}

// --- Payslips ---

export interface PayslipItem {
  _id: string;
  teacher: { _id: string; name: string; employeeId: string; designation?: string };
  month: number;
  year: number;
  basicPay: number;
  allowances: SalaryComponentDto[];
  deductions: SalaryComponentDto[];
  grossPay: number;
  netPay: number;
  status: PayslipStatus;
  generatedAt?: string;
  paidAt?: string;
}
export async function fetchPayslips(params: { teacher?: string; month?: number; year?: number }) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, String(value));
  });
  const res = await apiFetch<PayslipItem[]>(`/api/hr/payslips?${searchParams.toString()}`);
  return res.data ?? [];
}
export async function generatePayslipRequest(input: { teacher: string; month: number; year: number }) {
  return apiFetch<{ id: string }>("/api/hr/payslips", { method: "POST", body: JSON.stringify(input) });
}
export async function updatePayslipStatusRequest(id: string, status: PayslipStatus) {
  return apiFetch<{ id: string; status: PayslipStatus }>(`/api/hr/payslips/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

// --- Promotions ---

export interface PromotionHistoryItem {
  _id: string;
  fromDesignation: string;
  toDesignation: string;
  effectiveDate: string;
  remarks?: string;
  approvedBy: { name: string };
}
export async function fetchPromotionHistory(teacher: string) {
  const res = await apiFetch<PromotionHistoryItem[]>(`/api/hr/promotions?teacher=${teacher}`);
  return res.data ?? [];
}
export async function createPromotionHistoryRequest(input: {
  teacher: string;
  fromDesignation: string;
  toDesignation: string;
  effectiveDate: string;
  remarks?: string;
}) {
  return apiFetch<{ id: string }>("/api/hr/promotions", { method: "POST", body: JSON.stringify(input) });
}

// --- Employee documents ---

export interface EmployeeDocumentItem {
  _id: string;
  docType: EmployeeDocumentType;
  fileUrl: string;
  fileName: string;
  uploadedBy: { name: string };
  createdAt: string;
}
export async function fetchEmployeeDocuments(teacher: string) {
  const res = await apiFetch<EmployeeDocumentItem[]>(`/api/hr/documents?teacher=${teacher}`);
  return res.data ?? [];
}
export async function createEmployeeDocumentRequest(input: {
  teacher: string;
  docType: EmployeeDocumentType;
  fileUrl: string;
  fileName: string;
}) {
  return apiFetch<{ id: string }>("/api/hr/documents", { method: "POST", body: JSON.stringify(input) });
}
export async function deleteEmployeeDocumentRequest(id: string) {
  await apiFetch(`/api/hr/documents/${id}`, { method: "DELETE" });
}

// --- Performance reviews ---

export interface PerformanceReviewItem {
  _id: string;
  academicYear: { name: string };
  reviewedBy: { name: string };
  rating: number;
  strengths?: string;
  areasOfImprovement?: string;
  goals?: string;
  reviewDate: string;
}
export async function fetchPerformanceReviews(teacher: string) {
  const res = await apiFetch<PerformanceReviewItem[]>(`/api/hr/performance-reviews?teacher=${teacher}`);
  return res.data ?? [];
}
export async function createPerformanceReviewRequest(input: {
  teacher: string;
  academicYear: string;
  rating: number;
  strengths?: string;
  areasOfImprovement?: string;
  goals?: string;
  reviewDate: string;
}) {
  return apiFetch<{ id: string }>("/api/hr/performance-reviews", { method: "POST", body: JSON.stringify(input) });
}

// --- Digital employee file ---

export interface EmployeeFile {
  teacher: {
    _id: string;
    name: string;
    employeeId: string;
    designation?: string;
    qualification: string;
    joiningDate: string;
    experienceYears: number;
    status: string;
    photoUrl?: string;
  };
  salaryStructure: Omit<SalaryStructureItem, "teacher"> | null;
  recentPayslips: Omit<PayslipItem, "teacher">[];
  promotions: PromotionHistoryItem[];
  documents: EmployeeDocumentItem[];
  reviews: PerformanceReviewItem[];
  leaveRequests: Omit<StaffLeaveRequestItem, "teacher">[];
}
export async function fetchEmployeeFile(teacherId: string) {
  const res = await apiFetch<EmployeeFile>(`/api/hr/employees/${teacherId}/file`);
  return res.data as EmployeeFile;
}
export async function fetchMyEmployeeFile() {
  const res = await apiFetch<EmployeeFile>("/api/hr/employees/me/file");
  return res.data as EmployeeFile;
}
