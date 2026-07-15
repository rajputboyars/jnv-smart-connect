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

// --- Academic Years ---

export interface AcademicYearItem {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export interface AcademicYearInput {
  name: string;
  startDate: string;
  endDate: string;
  isActive: boolean;
}

export async function fetchAcademicYears() {
  const res = await apiFetch<AcademicYearItem[]>("/api/academic-years");
  return res.data ?? [];
}

export async function createAcademicYearRequest(input: AcademicYearInput) {
  const res = await apiFetch<{ id: string }>("/api/academic-years", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function updateAcademicYearRequest(id: string, input: Partial<AcademicYearInput>) {
  const res = await apiFetch<{ id: string }>(`/api/academic-years/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteAcademicYearRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/academic-years/${id}`, { method: "DELETE" });
}

// --- Classes ---

export interface ClassItem {
  id: string;
  name: string;
  numericLevel: number;
  academicYear?: { _id: string; name: string };
  subjects: { _id: string; name: string; code: string }[];
  sectionCount: number;
}

export interface ClassInput {
  name: string;
  numericLevel: number;
  academicYear: string;
  subjects: string[];
}

export async function fetchClasses() {
  const res = await apiFetch<ClassItem[]>("/api/classes");
  return res.data ?? [];
}

export async function createClassRequest(input: ClassInput) {
  const res = await apiFetch<{ id: string }>("/api/classes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function updateClassRequest(id: string, input: Partial<ClassInput>) {
  const res = await apiFetch<{ id: string }>(`/api/classes/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteClassRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/classes/${id}`, { method: "DELETE" });
}

// --- Sections ---

export interface SectionItem {
  id: string;
  name: string;
  class?: { _id: string; name: string; numericLevel: number };
  classTeacher?: { _id: string; name: string; employeeId: string };
  capacity: number;
  studentCount: number;
}

export interface SectionInput {
  name: string;
  class: string;
  academicYear: string;
  capacity: number;
  classTeacher?: string;
}

export async function fetchSections() {
  const res = await apiFetch<SectionItem[]>("/api/sections");
  return res.data ?? [];
}

export async function createSectionRequest(input: SectionInput) {
  const res = await apiFetch<{ id: string }>("/api/sections", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function updateSectionRequest(
  id: string,
  input: Partial<Omit<SectionInput, "class" | "academicYear">>
) {
  const res = await apiFetch<{ id: string }>(`/api/sections/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteSectionRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/sections/${id}`, { method: "DELETE" });
}

// --- Subjects (full CRUD) ---

export interface SubjectItem {
  id: string;
  name: string;
  code: string;
  type: "core" | "elective" | "co_curricular";
}

export interface SubjectInput {
  name: string;
  code: string;
  type: "core" | "elective" | "co_curricular";
}

export async function fetchSubjectsFull() {
  const res = await apiFetch<SubjectItem[]>("/api/subjects");
  return res.data ?? [];
}

export async function createSubjectRequest(input: SubjectInput) {
  const res = await apiFetch<{ id: string }>("/api/subjects", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function updateSubjectRequest(id: string, input: Partial<SubjectInput>) {
  const res = await apiFetch<{ id: string }>(`/api/subjects/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteSubjectRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/subjects/${id}`, { method: "DELETE" });
}
