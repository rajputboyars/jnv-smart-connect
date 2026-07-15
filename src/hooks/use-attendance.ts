"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchStudentRoster,
  submitStudentAttendance,
  fetchTeacherRoster,
  submitTeacherAttendance,
  fetchStudentAttendanceHistory,
  fetchClassAttendanceReport,
  createQrSession,
  checkInWithQr,
} from "@/services/attendance.service";
import { ApiClientError } from "@/lib/api-client";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

export function useStudentRoster(classId: string, sectionId: string, date: string) {
  return useQuery({
    queryKey: ["attendance", "student-roster", classId, sectionId, date],
    queryFn: () => fetchStudentRoster(classId, sectionId, date),
    enabled: !!classId && !!sectionId && !!date,
  });
}

export function useSubmitStudentAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitStudentAttendance,
    onSuccess: (result) => {
      toast.success(`Attendance saved for ${result.marked} students`);
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: handleError,
  });
}

export function useTeacherRoster(date: string) {
  return useQuery({
    queryKey: ["attendance", "teacher-roster", date],
    queryFn: () => fetchTeacherRoster(date),
    enabled: !!date,
  });
}

export function useSubmitTeacherAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitTeacherAttendance,
    onSuccess: (result) => {
      toast.success(`Attendance saved for ${result.marked} teachers`);
      queryClient.invalidateQueries({ queryKey: ["attendance"] });
    },
    onError: handleError,
  });
}

export function useStudentAttendanceHistory(params: {
  studentId?: string;
  from: string;
  to: string;
}) {
  return useQuery({
    queryKey: ["attendance", "history", params],
    queryFn: () => fetchStudentAttendanceHistory(params),
    enabled: !!params.from && !!params.to,
  });
}

export function useClassAttendanceReport(params: {
  classId: string;
  sectionId: string;
  from: string;
  to: string;
}) {
  return useQuery({
    queryKey: ["attendance", "report", params],
    queryFn: () => fetchClassAttendanceReport(params),
    enabled: !!params.classId && !!params.sectionId && !!params.from && !!params.to,
  });
}

export function useCreateQrSession() {
  return useMutation({
    mutationFn: createQrSession,
    onError: handleError,
  });
}

export function useCheckInWithQr() {
  return useMutation({
    mutationFn: checkInWithQr,
  });
}
