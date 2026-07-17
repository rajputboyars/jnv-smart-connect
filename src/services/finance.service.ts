import { apiFetch } from "@/lib/api-client";
import type { FeeFrequency, FeeInvoiceStatus, PaymentMethod, ScholarshipType, RefundStatus } from "@/models/enums";

// --- Fee categories ---

export interface FeeCategoryItem {
  _id: string;
  name: string;
  code: string;
  frequency: FeeFrequency;
  description?: string;
  isActive: boolean;
}

export interface FeeCategoryInput {
  name: string;
  code: string;
  frequency: FeeFrequency;
  description?: string;
}

export async function fetchFeeCategories() {
  const res = await apiFetch<FeeCategoryItem[]>("/api/finance/fee-categories");
  return res.data ?? [];
}
export async function createFeeCategoryRequest(input: FeeCategoryInput) {
  return apiFetch<{ id: string }>("/api/finance/fee-categories", { method: "POST", body: JSON.stringify(input) });
}
export async function updateFeeCategoryRequest(id: string, input: Partial<FeeCategoryInput & { isActive: boolean }>) {
  return apiFetch<{ id: string }>(`/api/finance/fee-categories/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
}
export async function deleteFeeCategoryRequest(id: string) {
  await apiFetch(`/api/finance/fee-categories/${id}`, { method: "DELETE" });
}

// --- Fee structures ---

export interface FeeStructureItem {
  _id: string;
  academicYear: { _id: string; name: string };
  class: { _id: string; name: string };
  feeCategory: { _id: string; name: string; code: string; frequency: FeeFrequency };
  amount: number;
  installments: number;
  dueDate: string;
  lateFeePerDay: number;
  maxLateFee: number;
}

export interface FeeStructureInput {
  academicYear: string;
  class: string;
  feeCategory: string;
  amount: number;
  installments: number;
  dueDate: string;
  lateFeePerDay: number;
  maxLateFee: number;
}

export async function fetchFeeStructures(academicYear?: string) {
  const params = academicYear ? `?academicYear=${academicYear}` : "";
  const res = await apiFetch<FeeStructureItem[]>(`/api/finance/fee-structures${params}`);
  return res.data ?? [];
}
export async function createFeeStructureRequest(input: FeeStructureInput) {
  return apiFetch<{ id: string }>("/api/finance/fee-structures", { method: "POST", body: JSON.stringify(input) });
}
export async function deleteFeeStructureRequest(id: string) {
  await apiFetch(`/api/finance/fee-structures/${id}`, { method: "DELETE" });
}
export async function generateInvoicesRequest(feeStructureId: string) {
  const res = await apiFetch<{ studentsProcessed: number; invoicesCreated: number }>(
    `/api/finance/fee-structures/${feeStructureId}/generate-invoices`,
    { method: "POST" }
  );
  return res.data!;
}

// --- Scholarships ---

export interface ScholarshipItem {
  _id: string;
  name: string;
  type: ScholarshipType;
  value: number;
  criteria?: string;
  isActive: boolean;
}
export interface ScholarshipInput {
  name: string;
  type: ScholarshipType;
  value: number;
  criteria?: string;
}
export async function fetchScholarships() {
  const res = await apiFetch<ScholarshipItem[]>("/api/finance/scholarships");
  return res.data ?? [];
}
export async function createScholarshipRequest(input: ScholarshipInput) {
  return apiFetch<{ id: string }>("/api/finance/scholarships", { method: "POST", body: JSON.stringify(input) });
}

export interface StudentScholarshipItem {
  _id: string;
  student: { _id: string; name: string; admissionNumber: string };
  scholarship: { _id: string; name: string; type: ScholarshipType; value: number };
  academicYear: { _id: string; name: string };
  approvedBy: { name: string };
  remarks?: string;
}
export async function fetchStudentScholarships(studentId?: string) {
  const params = studentId ? `?studentId=${studentId}` : "";
  const res = await apiFetch<StudentScholarshipItem[]>(`/api/finance/student-scholarships${params}`);
  return res.data ?? [];
}
export async function assignScholarshipRequest(input: {
  student: string;
  scholarship: string;
  academicYear: string;
  remarks?: string;
}) {
  return apiFetch<{ id: string }>("/api/finance/student-scholarships", {
    method: "POST",
    body: JSON.stringify(input),
  });
}
export async function revokeScholarshipRequest(id: string) {
  await apiFetch(`/api/finance/student-scholarships/${id}`, { method: "DELETE" });
}

// --- Invoices & payments ---

export interface FeeInvoiceItem {
  _id: string;
  student: { _id: string; name: string; admissionNumber: string; photoUrl?: string };
  feeCategory: { _id: string; name: string };
  invoiceNumber: string;
  installmentNumber: number;
  totalInstallments: number;
  amount: number;
  discountAmount: number;
  waiverAmount: number;
  lateFeeAmount: number;
  paidAmount: number;
  dueDate: string;
  status: FeeInvoiceStatus;
}

export interface InvoiceListParams {
  page: number;
  limit: number;
  status?: string;
  classId?: string;
  studentId?: string;
  search?: string;
}

export async function fetchInvoices(params: InvoiceListParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, String(value));
  });
  const res = await apiFetch<FeeInvoiceItem[]>(`/api/finance/invoices?${searchParams.toString()}`);
  return { items: res.data ?? [], pagination: res.pagination! };
}

export interface FeePaymentItem {
  _id: string;
  amount: number;
  method: PaymentMethod;
  receiptNumber: string;
  receivedBy: { name: string };
  paidAt: string;
  notes?: string;
}

export interface InvoiceDetail {
  invoice: FeeInvoiceItem & { student: FeeInvoiceItem["student"] & { currentClass: { name: string }; section: { name: string } } };
  payments: FeePaymentItem[];
  netPayable: number;
  balance: number;
}

export async function fetchInvoiceById(id: string) {
  const res = await apiFetch<InvoiceDetail>(`/api/finance/invoices/${id}`);
  return res.data!;
}

export async function recordPaymentRequest(
  invoiceId: string,
  input: { amount: number; method: PaymentMethod; transactionRef?: string; notes?: string }
) {
  return apiFetch<{ id: string; receiptNumber: string }>(`/api/finance/invoices/${invoiceId}/payments`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export async function createWaiverRequest(invoiceId: string, input: { amount: number; reason: string }) {
  return apiFetch<{ id: string }>(`/api/finance/invoices/${invoiceId}/waiver`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface ReceiptData {
  payment: {
    _id: string;
    amount: number;
    method: PaymentMethod;
    receiptNumber: string;
    paidAt: string;
    transactionRef?: string;
    student: { name: string; admissionNumber: string; currentClass: { name: string }; section: { name: string } };
    receivedBy: { name: string };
    invoice: { invoiceNumber: string; installmentNumber: number; totalInstallments: number; feeCategory: { name: string } };
  };
  school: { name: string; code: string; address?: string; contactPhone?: string; contactEmail?: string } | null;
}

export async function fetchReceipt(paymentId: string) {
  const res = await apiFetch<ReceiptData>(`/api/finance/payments/${paymentId}/receipt`);
  return res.data!;
}

// --- Refunds ---

export interface RefundItem {
  _id: string;
  student: { _id: string; name: string; admissionNumber: string };
  amount: number;
  reason: string;
  status: RefundStatus;
  requestedBy: { name: string };
  createdAt: string;
}
export async function fetchRefunds() {
  const res = await apiFetch<RefundItem[]>("/api/finance/refunds");
  return res.data ?? [];
}
export async function createRefundRequest(input: { payment: string; amount: number; reason: string }) {
  return apiFetch<{ id: string }>("/api/finance/refunds", { method: "POST", body: JSON.stringify(input) });
}
export async function reviewRefundRequest(id: string, status: RefundStatus) {
  return apiFetch<{ id: string; status: RefundStatus }>(`/api/finance/refunds/${id}/review`, {
    method: "POST",
    body: JSON.stringify({ status }),
  });
}

// --- Income, donations, expenses, vendors ---

export interface IncomeItem {
  _id: string;
  category: string;
  description: string;
  amount: number;
  date: string;
  source?: string;
  recordedBy: { name: string };
}
export async function fetchIncome(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const res = await apiFetch<IncomeItem[]>(`/api/finance/income?${params.toString()}`);
  return res.data ?? [];
}
export async function createIncomeRequest(input: {
  category: string;
  description: string;
  amount: number;
  date: string;
  source?: string;
}) {
  return apiFetch<{ id: string }>("/api/finance/income", { method: "POST", body: JSON.stringify(input) });
}

export interface DonationItem {
  _id: string;
  donorName: string;
  donorContact?: string;
  amount: number;
  purpose?: string;
  date: string;
  receiptNumber: string;
  receivedBy: { name: string };
}
export async function fetchDonations(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const res = await apiFetch<DonationItem[]>(`/api/finance/donations?${params.toString()}`);
  return res.data ?? [];
}
export async function createDonationRequest(input: {
  donorName: string;
  donorContact?: string;
  donorPan?: string;
  amount: number;
  purpose?: string;
  date: string;
}) {
  return apiFetch<{ id: string }>("/api/finance/donations", { method: "POST", body: JSON.stringify(input) });
}

export interface ExpenseItem {
  _id: string;
  category: string;
  vendor?: { _id: string; name: string };
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  billReference?: string;
  approvedBy: { name: string };
}
export async function fetchExpenses(from?: string, to?: string) {
  const params = new URLSearchParams();
  if (from) params.set("from", from);
  if (to) params.set("to", to);
  const res = await apiFetch<ExpenseItem[]>(`/api/finance/expenses?${params.toString()}`);
  return res.data ?? [];
}
export async function createExpenseRequest(input: {
  category: string;
  vendor?: string;
  description: string;
  amount: number;
  date: string;
  paymentMethod: PaymentMethod;
  billReference?: string;
}) {
  return apiFetch<{ id: string }>("/api/finance/expenses", { method: "POST", body: JSON.stringify(input) });
}

export interface VendorItem {
  _id: string;
  name: string;
  category: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  gstNumber?: string;
  isActive: boolean;
}
export async function fetchVendors() {
  const res = await apiFetch<VendorItem[]>("/api/finance/vendors");
  return res.data ?? [];
}
export async function createVendorRequest(input: {
  name: string;
  category: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  gstNumber?: string;
}) {
  return apiFetch<{ id: string }>("/api/finance/vendors", { method: "POST", body: JSON.stringify(input) });
}

export interface VendorPaymentItem {
  _id: string;
  vendor: { _id: string; name: string };
  amount: number;
  purpose: string;
  date: string;
  paymentMethod: PaymentMethod;
  approvedBy: { name: string };
}
export async function fetchVendorPayments(vendorId?: string) {
  const params = vendorId ? `?vendorId=${vendorId}` : "";
  const res = await apiFetch<VendorPaymentItem[]>(`/api/finance/vendor-payments${params}`);
  return res.data ?? [];
}
export async function createVendorPaymentRequest(input: {
  vendor: string;
  amount: number;
  purpose: string;
  date: string;
  paymentMethod: PaymentMethod;
  reference?: string;
}) {
  return apiFetch<{ id: string }>("/api/finance/vendor-payments", { method: "POST", body: JSON.stringify(input) });
}

// --- Budget ---

export interface BudgetItem {
  _id: string;
  academicYear: { _id: string; name: string };
  category: string;
  allocatedAmount: number;
  spentAmount: number;
  notes?: string;
}
export async function fetchBudgets(academicYear?: string) {
  const params = academicYear ? `?academicYear=${academicYear}` : "";
  const res = await apiFetch<BudgetItem[]>(`/api/finance/budgets${params}`);
  return res.data ?? [];
}
export async function createBudgetRequest(input: {
  academicYear: string;
  category: string;
  allocatedAmount: number;
  notes?: string;
}) {
  return apiFetch<{ id: string }>("/api/finance/budgets", { method: "POST", body: JSON.stringify(input) });
}

// --- Reports ---

export interface LedgerEntryDto {
  date: string;
  type: string;
  direction: "credit" | "debit";
  description: string;
  method: string;
  amount: number;
  balance: number;
}
export interface LedgerReport {
  entries: LedgerEntryDto[];
  closingBalance: number;
}
export async function fetchCashBook(from: string, to: string) {
  const res = await apiFetch<LedgerReport>(`/api/finance/reports/cash-book?from=${from}&to=${to}`);
  return res.data!;
}
export async function fetchLedger(from: string, to: string) {
  const res = await apiFetch<LedgerReport>(`/api/finance/reports/ledger?from=${from}&to=${to}`);
  return res.data!;
}
export async function fetchAuditReport(from: string, to: string) {
  const res = await apiFetch<LedgerReport>(`/api/finance/reports/audit?from=${from}&to=${to}`);
  return res.data!;
}

export interface MonthlyIncomeRow {
  month: number;
  feeCollection: number;
  otherIncome: number;
  donations: number;
  total: number;
}
export async function fetchMonthlyIncomeReport(year: number) {
  const res = await apiFetch<MonthlyIncomeRow[]>(`/api/finance/reports/monthly-income?year=${year}`);
  return res.data ?? [];
}

export interface AnnualReport {
  academicYear: { id: string; name: string };
  income: { feeCollection: number; otherIncome: number; donations: number; total: number };
  expenses: { byCategory: { category: string; total: number }[]; vendorPayments: number; total: number };
  concessions: { waivers: number; refunds: number };
  netSurplus: number;
}
export async function fetchAnnualReport(academicYear: string) {
  const res = await apiFetch<AnnualReport>(`/api/finance/reports/annual?academicYear=${academicYear}`);
  return res.data!;
}
