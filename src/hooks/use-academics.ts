"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchClassOptions,
  fetchSubjectOptions,
  fetchAcademicYears,
  createAcademicYearRequest,
  updateAcademicYearRequest,
  deleteAcademicYearRequest,
  fetchClasses,
  createClassRequest,
  updateClassRequest,
  deleteClassRequest,
  fetchSections,
  createSectionRequest,
  updateSectionRequest,
  deleteSectionRequest,
  fetchSubjectsFull,
  createSubjectRequest,
  updateSubjectRequest,
  deleteSubjectRequest,
  type AcademicYearInput,
  type ClassInput,
  type SubjectInput,
} from "@/services/academics.service";
import { ApiClientError } from "@/lib/api-client";

export function useClassOptions() {
  return useQuery({ queryKey: ["academics", "classes"], queryFn: fetchClassOptions, staleTime: 5 * 60 * 1000 });
}

export function useSubjectOptions() {
  return useQuery({ queryKey: ["academics", "subjects"], queryFn: fetchSubjectOptions, staleTime: 5 * 60 * 1000 });
}

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

// --- Academic Years ---

export function useAcademicYears() {
  return useQuery({ queryKey: ["academic-years"], queryFn: fetchAcademicYears });
}

export function useCreateAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createAcademicYearRequest,
    onSuccess: () => {
      toast.success("Academic year created");
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
    onError: handleError,
  });
}

export function useUpdateAcademicYear(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<AcademicYearInput>) => updateAcademicYearRequest(id, input),
    onSuccess: () => {
      toast.success("Academic year updated");
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
    onError: handleError,
  });
}

export function useDeleteAcademicYear() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteAcademicYearRequest,
    onSuccess: () => {
      toast.success("Academic year removed");
      queryClient.invalidateQueries({ queryKey: ["academic-years"] });
    },
    onError: handleError,
  });
}

// --- Classes ---

export function useClasses() {
  return useQuery({ queryKey: ["classes"], queryFn: fetchClasses });
}

export function useCreateClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createClassRequest,
    onSuccess: () => {
      toast.success("Class created");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["academics", "classes"] });
    },
    onError: handleError,
  });
}

export function useUpdateClass(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<ClassInput>) => updateClassRequest(id, input),
    onSuccess: () => {
      toast.success("Class updated");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["academics", "classes"] });
    },
    onError: handleError,
  });
}

export function useDeleteClass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteClassRequest,
    onSuccess: () => {
      toast.success("Class removed");
      queryClient.invalidateQueries({ queryKey: ["classes"] });
      queryClient.invalidateQueries({ queryKey: ["academics", "classes"] });
    },
    onError: handleError,
  });
}

// --- Sections ---

export function useSections() {
  return useQuery({ queryKey: ["sections"], queryFn: fetchSections });
}

export function useCreateSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSectionRequest,
    onSuccess: () => {
      toast.success("Section created");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["academics", "classes"] });
    },
    onError: handleError,
  });
}

export function useUpdateSection(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Parameters<typeof updateSectionRequest>[1]) => updateSectionRequest(id, input),
    onSuccess: () => {
      toast.success("Section updated");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
    },
    onError: handleError,
  });
}

export function useDeleteSection() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSectionRequest,
    onSuccess: () => {
      toast.success("Section removed");
      queryClient.invalidateQueries({ queryKey: ["sections"] });
      queryClient.invalidateQueries({ queryKey: ["academics", "classes"] });
    },
    onError: handleError,
  });
}

// --- Subjects (full CRUD) ---

export function useSubjectsFull() {
  return useQuery({ queryKey: ["subjects"], queryFn: fetchSubjectsFull });
}

export function useCreateSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createSubjectRequest,
    onSuccess: () => {
      toast.success("Subject created");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["academics", "subjects"] });
    },
    onError: handleError,
  });
}

export function useUpdateSubject(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<SubjectInput>) => updateSubjectRequest(id, input),
    onSuccess: () => {
      toast.success("Subject updated");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["academics", "subjects"] });
    },
    onError: handleError,
  });
}

export function useDeleteSubject() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteSubjectRequest,
    onSuccess: () => {
      toast.success("Subject removed");
      queryClient.invalidateQueries({ queryKey: ["subjects"] });
      queryClient.invalidateQueries({ queryKey: ["academics", "subjects"] });
    },
    onError: handleError,
  });
}
