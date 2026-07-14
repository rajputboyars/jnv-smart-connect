"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchStudents,
  fetchStudent,
  createStudentRequest,
  updateStudentRequest,
  deleteStudentRequest,
  type StudentListParams,
} from "@/services/student.service";
import { ApiClientError } from "@/lib/api-client";

export function useStudents(params: StudentListParams) {
  return useQuery({
    queryKey: ["students", params],
    queryFn: () => fetchStudents(params),
    placeholderData: (prev) => prev,
  });
}

export function useStudent(id: string) {
  return useQuery({
    queryKey: ["students", id],
    queryFn: () => fetchStudent(id),
    enabled: !!id,
  });
}

export function useDeleteStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteStudentRequest,
    onSuccess: () => {
      toast.success("Student removed");
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
    },
  });
}

export function useCreateStudent() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createStudentRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}

export function useUpdateStudent(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof updateStudentRequest>[1]) =>
      updateStudentRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["students"] });
    },
  });
}
