"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as svc from "@/services/hr.service";
import { ApiClientError } from "@/lib/api-client";
import type { LeaveRequestStatus, PayslipStatus } from "@/models/enums";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

// --- Staff leave ---

export function useStaffLeaveRequests(status?: string) {
  return useQuery({ queryKey: ["hr", "leave-requests", status], queryFn: () => svc.fetchStaffLeaveRequests(status) });
}
export function useCreateStaffLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createStaffLeaveRequestRequest,
    onSuccess: () => {
      toast.success("Leave request submitted");
      qc.invalidateQueries({ queryKey: ["hr", "leave-requests"] });
    },
    onError: handleError,
  });
}
export function useReviewStaffLeaveRequest() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, reviewNote }: { id: string; status: LeaveRequestStatus; reviewNote?: string }) =>
      svc.reviewStaffLeaveRequestRequest(id, { status, reviewNote }),
    onSuccess: () => {
      toast.success("Leave request updated");
      qc.invalidateQueries({ queryKey: ["hr", "leave-requests"] });
    },
    onError: handleError,
  });
}

// --- Salary structures ---

export function useSalaryStructures(teacher?: string) {
  return useQuery({ queryKey: ["hr", "salary-structures", teacher], queryFn: () => svc.fetchSalaryStructures(teacher) });
}
export function useCreateSalaryStructure() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createSalaryStructureRequest,
    onSuccess: () => {
      toast.success("Salary structure saved");
      qc.invalidateQueries({ queryKey: ["hr", "salary-structures"] });
    },
    onError: handleError,
  });
}

// --- Payslips ---

export function usePayslips(params: { teacher?: string; month?: number; year?: number }) {
  return useQuery({ queryKey: ["hr", "payslips", params], queryFn: () => svc.fetchPayslips(params) });
}
export function useGeneratePayslip() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.generatePayslipRequest,
    onSuccess: () => {
      toast.success("Payslip generated");
      qc.invalidateQueries({ queryKey: ["hr", "payslips"] });
    },
    onError: handleError,
  });
}
export function useUpdatePayslipStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: PayslipStatus }) => svc.updatePayslipStatusRequest(id, status),
    onSuccess: () => {
      toast.success("Payslip updated");
      qc.invalidateQueries({ queryKey: ["hr", "payslips"] });
    },
    onError: handleError,
  });
}

// --- Promotions ---

export function usePromotionHistory(teacher: string) {
  return useQuery({
    queryKey: ["hr", "promotions", teacher],
    queryFn: () => svc.fetchPromotionHistory(teacher),
    enabled: !!teacher,
  });
}
export function useCreatePromotionHistory() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createPromotionHistoryRequest,
    onSuccess: () => {
      toast.success("Promotion recorded");
      qc.invalidateQueries({ queryKey: ["hr", "promotions"] });
      qc.invalidateQueries({ queryKey: ["hr", "employee-file"] });
    },
    onError: handleError,
  });
}

// --- Employee documents ---

export function useEmployeeDocuments(teacher: string) {
  return useQuery({
    queryKey: ["hr", "documents", teacher],
    queryFn: () => svc.fetchEmployeeDocuments(teacher),
    enabled: !!teacher,
  });
}
export function useCreateEmployeeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createEmployeeDocumentRequest,
    onSuccess: () => {
      toast.success("Document uploaded");
      qc.invalidateQueries({ queryKey: ["hr", "documents"] });
      qc.invalidateQueries({ queryKey: ["hr", "employee-file"] });
    },
    onError: handleError,
  });
}
export function useDeleteEmployeeDocument() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.deleteEmployeeDocumentRequest,
    onSuccess: () => {
      toast.success("Document removed");
      qc.invalidateQueries({ queryKey: ["hr", "documents"] });
      qc.invalidateQueries({ queryKey: ["hr", "employee-file"] });
    },
    onError: handleError,
  });
}

// --- Performance reviews ---

export function usePerformanceReviews(teacher: string) {
  return useQuery({
    queryKey: ["hr", "performance-reviews", teacher],
    queryFn: () => svc.fetchPerformanceReviews(teacher),
    enabled: !!teacher,
  });
}
export function useCreatePerformanceReview() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createPerformanceReviewRequest,
    onSuccess: () => {
      toast.success("Performance review recorded");
      qc.invalidateQueries({ queryKey: ["hr", "performance-reviews"] });
      qc.invalidateQueries({ queryKey: ["hr", "employee-file"] });
    },
    onError: handleError,
  });
}

// --- Digital employee file ---

export function useEmployeeFile(teacherId: string) {
  return useQuery({
    queryKey: ["hr", "employee-file", teacherId],
    queryFn: () => svc.fetchEmployeeFile(teacherId),
    enabled: !!teacherId,
  });
}
export function useMyEmployeeFile(enabled = true) {
  return useQuery({ queryKey: ["hr", "employee-file", "me"], queryFn: svc.fetchMyEmployeeFile, enabled });
}
