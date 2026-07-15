"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchTeachers,
  fetchTeacher,
  createTeacherRequest,
  updateTeacherRequest,
  deleteTeacherRequest,
  fetchTeacherOptions,
  fetchTeacherAllocations,
  type TeacherListParams,
} from "@/services/teacher.service";
import { ApiClientError } from "@/lib/api-client";

export function useTeachers(params: TeacherListParams) {
  return useQuery({
    queryKey: ["teachers", params],
    queryFn: () => fetchTeachers(params),
    placeholderData: (prev) => prev,
  });
}

export function useTeacher(id: string) {
  return useQuery({
    queryKey: ["teachers", id],
    queryFn: () => fetchTeacher(id),
    enabled: !!id,
  });
}

export function useDeleteTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: deleteTeacherRequest,
    onSuccess: () => {
      toast.success("Teacher removed");
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
    onError: (error) => {
      toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
    },
  });
}

export function useCreateTeacher() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: createTeacherRequest,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useUpdateTeacher(id: string) {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (input: Parameters<typeof updateTeacherRequest>[1]) =>
      updateTeacherRequest(id, input),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["teachers"] });
    },
  });
}

export function useTeacherOptions() {
  return useQuery({
    queryKey: ["teachers", "options"],
    queryFn: fetchTeacherOptions,
    staleTime: 5 * 60 * 1000,
  });
}

export function useTeacherAllocations() {
  return useQuery({ queryKey: ["teachers", "allocations"], queryFn: fetchTeacherAllocations });
}
