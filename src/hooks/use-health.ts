"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchMedicalReport,
  createMedicineLogRequest,
  createDoctorVisitRequest,
} from "@/services/health.service";
import { ApiClientError } from "@/lib/api-client";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

export function useMedicalReport(studentId?: string, enabled = true) {
  return useQuery({
    queryKey: ["health", "report", studentId],
    queryFn: () => fetchMedicalReport(studentId),
    enabled,
  });
}

export function useCreateMedicineLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createMedicineLogRequest,
    onSuccess: () => {
      toast.success("Medicine log recorded");
      queryClient.invalidateQueries({ queryKey: ["health"] });
    },
    onError: handleError,
  });
}

export function useCreateDoctorVisit() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createDoctorVisitRequest,
    onSuccess: () => {
      toast.success("Doctor visit recorded");
      queryClient.invalidateQueries({ queryKey: ["health"] });
    },
    onError: handleError,
  });
}
