"use client";

import { useQuery } from "@tanstack/react-query";
import { fetchClassOptions, fetchSubjectOptions } from "@/services/academics.service";

export function useClassOptions() {
  return useQuery({ queryKey: ["academics", "classes"], queryFn: fetchClassOptions, staleTime: 5 * 60 * 1000 });
}

export function useSubjectOptions() {
  return useQuery({ queryKey: ["academics", "subjects"], queryFn: fetchSubjectOptions, staleTime: 5 * 60 * 1000 });
}
