import { apiFetch } from "@/lib/api-client";
import type { CreateTeacherInput, UpdateTeacherInput } from "@/validators/teacher.validator";

export interface TeacherListItem {
  _id: string;
  employeeId: string;
  name: string;
  email: string;
  phone: string;
  photoUrl?: string;
  qualification: string;
  status: string;
  subjects: { _id: string; name: string }[];
}

export interface TeacherDetail extends TeacherListItem {
  designation?: string;
  experienceYears: number;
  joiningDate: string;
  assignedClasses: {
    class: { _id: string; name: string };
    section: { _id: string; name: string };
    subject: { _id: string; name: string };
  }[];
}

export interface TeacherListParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: string;
}

export async function fetchTeachers(params: TeacherListParams) {
  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value) searchParams.set(key, String(value));
  });

  const res = await apiFetch<TeacherListItem[]>(`/api/teachers?${searchParams.toString()}`);
  return { items: res.data ?? [], pagination: res.pagination! };
}

export async function fetchTeacher(id: string) {
  const res = await apiFetch<TeacherDetail>(`/api/teachers/${id}`);
  return res.data as TeacherDetail;
}

export async function createTeacherRequest(input: CreateTeacherInput) {
  const res = await apiFetch<{ id: string }>("/api/teachers", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function updateTeacherRequest(id: string, input: UpdateTeacherInput) {
  const res = await apiFetch<{ id: string }>(`/api/teachers/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteTeacherRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/teachers/${id}`, { method: "DELETE" });
}

export interface TeacherOption {
  id: string;
  name: string;
  employeeId: string;
}

/** Small unpaginated list for dropdowns (class teacher assignment, etc.). */
export async function fetchTeacherOptions() {
  const res = await apiFetch<TeacherListItem[]>("/api/teachers?limit=100&status=active");
  return (res.data ?? []).map((t) => ({ id: t._id, name: t.name, employeeId: t.employeeId }));
}

export interface TeacherAllocation {
  id: string;
  name: string;
  employeeId: string;
  assignedClasses: {
    class: { _id: string; name: string };
    section: { _id: string; name: string };
    subject: { _id: string; name: string };
  }[];
}

export async function fetchTeacherAllocations() {
  const res = await apiFetch<TeacherAllocation[]>("/api/teachers/allocations");
  return res.data ?? [];
}
