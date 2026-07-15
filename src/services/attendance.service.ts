import { apiFetch } from "@/lib/api-client";
import type { AttendanceStatus } from "@/models/enums";

export interface RosterEntry {
  status: AttendanceStatus;
  remarks: string;
}

export interface StudentRosterEntry extends RosterEntry {
  student: {
    id: string;
    name: string;
    admissionNumber: string;
    rollNumber?: string;
    photoUrl?: string;
  };
}

export interface TeacherRosterEntry extends RosterEntry {
  teacher: {
    id: string;
    name: string;
    employeeId: string;
    photoUrl?: string;
  };
}

export async function fetchStudentRoster(classId: string, sectionId: string, date: string) {
  const res = await apiFetch<StudentRosterEntry[]>(
    `/api/attendance/students/roster?classId=${classId}&sectionId=${sectionId}&date=${date}`
  );
  return res.data ?? [];
}

export interface BulkAttendanceRecord {
  student: string;
  status: AttendanceStatus;
  remarks?: string;
}

export async function submitStudentAttendance(input: {
  class: string;
  section: string;
  date: string;
  records: BulkAttendanceRecord[];
}) {
  const res = await apiFetch<{ marked: number }>("/api/attendance/students/bulk", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { marked: number };
}

export async function fetchTeacherRoster(date: string) {
  const res = await apiFetch<TeacherRosterEntry[]>(`/api/attendance/teachers/roster?date=${date}`);
  return res.data ?? [];
}

export async function submitTeacherAttendance(input: {
  date: string;
  records: { teacher: string; status: AttendanceStatus; remarks?: string }[];
}) {
  const res = await apiFetch<{ marked: number }>("/api/attendance/teachers/bulk", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { marked: number };
}

export interface AttendanceHistory {
  records: { date: string; status: AttendanceStatus; remarks?: string }[];
  summary: Record<AttendanceStatus | "total", number>;
  percentage: number;
}

export async function fetchStudentAttendanceHistory(params: {
  studentId?: string;
  from: string;
  to: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("from", params.from);
  searchParams.set("to", params.to);
  if (params.studentId) searchParams.set("studentId", params.studentId);

  const res = await apiFetch<AttendanceHistory>(
    `/api/attendance/students/history?${searchParams.toString()}`
  );
  return res.data as AttendanceHistory;
}

export interface ClassAttendanceReportRow {
  student: { id: string; name: string; admissionNumber: string; rollNumber?: string };
  total: number;
  present: number;
  absent: number;
  late: number;
  halfDay: number;
  leave: number;
  percentage: number;
}

export async function fetchClassAttendanceReport(params: {
  classId: string;
  sectionId: string;
  from: string;
  to: string;
}) {
  const searchParams = new URLSearchParams(params);
  const res = await apiFetch<ClassAttendanceReportRow[]>(
    `/api/attendance/students/report?${searchParams.toString()}`
  );
  return res.data ?? [];
}

export interface QrSessionResult {
  sessionId: string;
  token: string;
  expiresAt: string;
  checkinUrl: string;
  qrDataUrl: string;
}

export async function createQrSession(input: {
  class: string;
  section: string;
  subject?: string;
  date: string;
  period?: number;
  expiresInMinutes: number;
}) {
  const res = await apiFetch<QrSessionResult>("/api/attendance/qr/session", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as QrSessionResult;
}

export async function checkInWithQr(token: string) {
  const res = await apiFetch<{ message: string }>("/api/attendance/qr/checkin", {
    method: "POST",
    body: JSON.stringify({ token }),
  });
  return res.message ?? "Checked in";
}
