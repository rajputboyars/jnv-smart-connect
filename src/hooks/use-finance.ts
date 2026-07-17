"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as svc from "@/services/finance.service";
import { ApiClientError } from "@/lib/api-client";
import type { RefundStatus } from "@/models/enums";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

// --- Fee categories ---

export function useFeeCategories() {
  return useQuery({ queryKey: ["finance", "fee-categories"], queryFn: svc.fetchFeeCategories });
}
export function useCreateFeeCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createFeeCategoryRequest,
    onSuccess: () => {
      toast.success("Fee category created");
      qc.invalidateQueries({ queryKey: ["finance", "fee-categories"] });
    },
    onError: handleError,
  });
}
export function useDeleteFeeCategory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deleteFeeCategoryRequest,
    onSuccess: () => {
      toast.success("Fee category removed");
      qc.invalidateQueries({ queryKey: ["finance", "fee-categories"] });
    },
    onError: handleError,
  });
}

// --- Fee structures ---

export function useFeeStructures(academicYear?: string) {
  return useQuery({
    queryKey: ["finance", "fee-structures", academicYear],
    queryFn: () => svc.fetchFeeStructures(academicYear),
  });
}
export function useCreateFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createFeeStructureRequest,
    onSuccess: () => {
      toast.success("Fee structure created");
      qc.invalidateQueries({ queryKey: ["finance", "fee-structures"] });
    },
    onError: handleError,
  });
}
export function useDeleteFeeStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deleteFeeStructureRequest,
    onSuccess: () => {
      toast.success("Fee structure removed");
      qc.invalidateQueries({ queryKey: ["finance", "fee-structures"] });
    },
    onError: handleError,
  });
}
export function useGenerateInvoices() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.generateInvoicesRequest,
    onSuccess: (result) => {
      toast.success(`Generated ${result.invoicesCreated} invoice(s) for ${result.studentsProcessed} student(s)`);
      qc.invalidateQueries({ queryKey: ["finance", "invoices"] });
    },
    onError: handleError,
  });
}

// --- Scholarships ---

export function useScholarships() {
  return useQuery({ queryKey: ["finance", "scholarships"], queryFn: svc.fetchScholarships });
}
export function useCreateScholarship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createScholarshipRequest,
    onSuccess: () => {
      toast.success("Scholarship created");
      qc.invalidateQueries({ queryKey: ["finance", "scholarships"] });
    },
    onError: handleError,
  });
}
export function useStudentScholarships(studentId?: string) {
  return useQuery({
    queryKey: ["finance", "student-scholarships", studentId],
    queryFn: () => svc.fetchStudentScholarships(studentId),
  });
}
export function useAssignScholarship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.assignScholarshipRequest,
    onSuccess: () => {
      toast.success("Scholarship assigned");
      qc.invalidateQueries({ queryKey: ["finance", "student-scholarships"] });
    },
    onError: handleError,
  });
}
export function useRevokeScholarship() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.revokeScholarshipRequest,
    onSuccess: () => {
      toast.success("Scholarship revoked");
      qc.invalidateQueries({ queryKey: ["finance", "student-scholarships"] });
    },
    onError: handleError,
  });
}

// --- Invoices & payments ---

export function useInvoices(params: svc.InvoiceListParams) {
  return useQuery({
    queryKey: ["finance", "invoices", params],
    queryFn: () => svc.fetchInvoices(params),
    placeholderData: (prev) => prev,
  });
}
export function useInvoice(id: string) {
  return useQuery({ queryKey: ["finance", "invoice", id], queryFn: () => svc.fetchInvoiceById(id), enabled: !!id });
}
export function useRecordPayment(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof svc.recordPaymentRequest>[1]) =>
      svc.recordPaymentRequest(invoiceId, input),
    onSuccess: () => {
      toast.success("Payment recorded");
      qc.invalidateQueries({ queryKey: ["finance", "invoice", invoiceId] });
      qc.invalidateQueries({ queryKey: ["finance", "invoices"] });
    },
    onError: handleError,
  });
}
export function useCreateWaiver(invoiceId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof svc.createWaiverRequest>[1]) => svc.createWaiverRequest(invoiceId, input),
    onSuccess: () => {
      toast.success("Waiver applied");
      qc.invalidateQueries({ queryKey: ["finance", "invoice", invoiceId] });
      qc.invalidateQueries({ queryKey: ["finance", "invoices"] });
    },
    onError: handleError,
  });
}
export function useReceipt(paymentId: string | null) {
  return useQuery({
    queryKey: ["finance", "receipt", paymentId],
    queryFn: () => svc.fetchReceipt(paymentId as string),
    enabled: !!paymentId,
  });
}

// --- Refunds ---

export function useRefunds() {
  return useQuery({ queryKey: ["finance", "refunds"], queryFn: svc.fetchRefunds });
}
export function useCreateRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createRefundRequest,
    onSuccess: () => {
      toast.success("Refund requested");
      qc.invalidateQueries({ queryKey: ["finance", "refunds"] });
    },
    onError: handleError,
  });
}
export function useReviewRefund() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: RefundStatus }) => svc.reviewRefundRequest(id, status),
    onSuccess: () => {
      toast.success("Refund updated");
      qc.invalidateQueries({ queryKey: ["finance", "refunds"] });
      qc.invalidateQueries({ queryKey: ["finance", "invoices"] });
    },
    onError: handleError,
  });
}

// --- Income / Donations / Expenses / Vendors ---

export function useIncome(from?: string, to?: string) {
  return useQuery({ queryKey: ["finance", "income", from, to], queryFn: () => svc.fetchIncome(from, to) });
}
export function useCreateIncome() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createIncomeRequest,
    onSuccess: () => {
      toast.success("Income recorded");
      qc.invalidateQueries({ queryKey: ["finance", "income"] });
    },
    onError: handleError,
  });
}

export function useDonations(from?: string, to?: string) {
  return useQuery({ queryKey: ["finance", "donations", from, to], queryFn: () => svc.fetchDonations(from, to) });
}
export function useCreateDonation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createDonationRequest,
    onSuccess: () => {
      toast.success("Donation recorded");
      qc.invalidateQueries({ queryKey: ["finance", "donations"] });
    },
    onError: handleError,
  });
}

export function useExpenses(from?: string, to?: string) {
  return useQuery({ queryKey: ["finance", "expenses", from, to], queryFn: () => svc.fetchExpenses(from, to) });
}
export function useCreateExpense() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createExpenseRequest,
    onSuccess: () => {
      toast.success("Expense recorded");
      qc.invalidateQueries({ queryKey: ["finance", "expenses"] });
    },
    onError: handleError,
  });
}

export function useVendors() {
  return useQuery({ queryKey: ["finance", "vendors"], queryFn: svc.fetchVendors });
}
export function useCreateVendor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createVendorRequest,
    onSuccess: () => {
      toast.success("Vendor added");
      qc.invalidateQueries({ queryKey: ["finance", "vendors"] });
    },
    onError: handleError,
  });
}

export function useVendorPayments(vendorId?: string) {
  return useQuery({
    queryKey: ["finance", "vendor-payments", vendorId],
    queryFn: () => svc.fetchVendorPayments(vendorId),
  });
}
export function useCreateVendorPayment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createVendorPaymentRequest,
    onSuccess: () => {
      toast.success("Vendor payment recorded");
      qc.invalidateQueries({ queryKey: ["finance", "vendor-payments"] });
    },
    onError: handleError,
  });
}

// --- Budget ---

export function useBudgets(academicYear?: string) {
  return useQuery({ queryKey: ["finance", "budgets", academicYear], queryFn: () => svc.fetchBudgets(academicYear) });
}
export function useCreateBudget() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createBudgetRequest,
    onSuccess: () => {
      toast.success("Budget created");
      qc.invalidateQueries({ queryKey: ["finance", "budgets"] });
    },
    onError: handleError,
  });
}

// --- Reports ---

export function useCashBook(from: string, to: string) {
  return useQuery({
    queryKey: ["finance", "cash-book", from, to],
    queryFn: () => svc.fetchCashBook(from, to),
    enabled: !!from && !!to,
  });
}
export function useLedger(from: string, to: string) {
  return useQuery({
    queryKey: ["finance", "ledger", from, to],
    queryFn: () => svc.fetchLedger(from, to),
    enabled: !!from && !!to,
  });
}
export function useAuditReport(from: string, to: string) {
  return useQuery({
    queryKey: ["finance", "audit", from, to],
    queryFn: () => svc.fetchAuditReport(from, to),
    enabled: !!from && !!to,
  });
}
export function useMonthlyIncomeReport(year: number) {
  return useQuery({
    queryKey: ["finance", "monthly-income", year],
    queryFn: () => svc.fetchMonthlyIncomeReport(year),
  });
}
export function useAnnualReport(academicYear: string) {
  return useQuery({
    queryKey: ["finance", "annual", academicYear],
    queryFn: () => svc.fetchAnnualReport(academicYear),
    enabled: !!academicYear,
  });
}
