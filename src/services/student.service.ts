import { apiFetch } from "@/lib/api-client";
import type { CreateStudentInput, UpdateStudentInput } from "@/validators/student.validator";

export interface StudentListItem {
  _id: string;
  admissionNumber: string;
  rollNumber?: string;
  name: string;
  photoUrl?: string;
  gender: string;
  status: string;
  currentClass?: { _id: string; name: string };
  section?: { _id: string; name: string };
}

export interface StudentDetail extends StudentListItem {
  dob: string;
  bloodGroup?: string;
  house?: string;
  isHosteller: boolean;
  aadhaarNumber?: string;
  previousSchool?: string;
  address?: Record<string, string | undefined>;
  guardianDetails?: Record<string, string | undefined>;
  emergencyContact?: { name: string; relation: string; phone: string };
  medicalInfo?: Record<string, string | undefined>;
  admissionDate: string;
}

export interface StudentListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
  classId?: string;
  sectionId?: string;
}

export async function fetchStudents(params: StudentListParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, String(value));
  });

  const res = await apiFetch<StudentListItem[]>(`/api/students?${searchParams.toString()}`);
  return { items: res.data ?? [], pagination: res.pagination! };
}

export async function fetchStudent(id: string) {
  const res = await apiFetch<StudentDetail>(`/api/students/${id}`);
  return res.data as StudentDetail;
}

export async function createStudentRequest(input: CreateStudentInput) {
  const res = await apiFetch<{ id: string }>("/api/students", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function updateStudentRequest(id: string, input: UpdateStudentInput) {
  const res = await apiFetch<{ id: string }>(`/api/students/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteStudentRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/students/${id}`, { method: "DELETE" });
}
