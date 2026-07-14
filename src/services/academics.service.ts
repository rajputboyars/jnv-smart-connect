import { apiFetch } from "@/lib/api-client";

export interface ClassOption {
  id: string;
  name: string;
  sections: { id: string; name: string }[];
}

export interface SubjectOption {
  id: string;
  name: string;
  code: string;
}

export async function fetchClassOptions() {
  const res = await apiFetch<ClassOption[]>("/api/academics/classes");
  return res.data ?? [];
}

export async function fetchSubjectOptions() {
  const res = await apiFetch<SubjectOption[]>("/api/academics/subjects");
  return res.data ?? [];
}
