import { apiFetch } from "@/lib/api-client";
import type { HostelNightStatus, LeaveRequestStatus, GatePassStatus } from "@/models/enums";

// --- Buildings ---

export interface HostelBuildingItem {
  id: string;
  name: string;
  code: string;
  gender: "boys" | "girls" | "mixed";
  warden?: { _id: string; name: string; employeeId: string };
  totalFloors: number;
  roomCount: number;
  bedCount: number;
}

export interface HostelBuildingInput {
  name: string;
  code: string;
  gender: "boys" | "girls" | "mixed";
  warden?: string;
  totalFloors: number;
}

export async function fetchHostelBuildings() {
  const res = await apiFetch<HostelBuildingItem[]>("/api/hostel/buildings");
  return res.data ?? [];
}

export async function createHostelBuildingRequest(input: HostelBuildingInput) {
  const res = await apiFetch<{ id: string }>("/api/hostel/buildings", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function updateHostelBuildingRequest(id: string, input: Partial<HostelBuildingInput>) {
  const res = await apiFetch<{ id: string }>(`/api/hostel/buildings/${id}`, {
    method: "PATCH",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteHostelBuildingRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/hostel/buildings/${id}`, { method: "DELETE" });
}

// --- Rooms ---

export interface HostelRoomItem {
  id: string;
  roomNumber: string;
  floor: number;
  bedCount: number;
  building?: { _id: string; name: string; code: string };
  occupied: number;
}

export interface HostelRoomInput {
  building: string;
  roomNumber: string;
  floor: number;
  bedCount: number;
}

export async function fetchHostelRooms() {
  const res = await apiFetch<HostelRoomItem[]>("/api/hostel/rooms");
  return res.data ?? [];
}

export async function createHostelRoomRequest(input: HostelRoomInput) {
  const res = await apiFetch<{ id: string }>("/api/hostel/rooms", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function deleteHostelRoomRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/hostel/rooms/${id}`, { method: "DELETE" });
}

// --- Allocation ---

export interface HostelAllocationItem {
  id: string;
  student: { _id: string; name: string; admissionNumber: string; photoUrl?: string };
  room: { _id: string; roomNumber: string; floor: number; building: { _id: string; name: string; code: string } };
  bedNumber: number;
  allocatedAt: string;
}

export async function fetchHostelAllocations() {
  const res = await apiFetch<HostelAllocationItem[]>("/api/hostel/allocations");
  return res.data ?? [];
}

export async function allocateBedRequest(input: { student: string; room: string; bedNumber: number }) {
  const res = await apiFetch<{ id: string }>("/api/hostel/allocations", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function vacateBedRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/hostel/allocations/${id}/vacate`, { method: "POST" });
}

// --- Night attendance ---

export interface HostelRosterEntry {
  student: { id: string; name: string; admissionNumber: string; photoUrl?: string };
  room?: { roomNumber: string };
  status: HostelNightStatus;
  remarks: string;
}

export async function fetchHostelRoster(buildingId: string, date: string) {
  const res = await apiFetch<HostelRosterEntry[]>(
    `/api/hostel/attendance/roster?buildingId=${buildingId}&date=${date}`
  );
  return res.data ?? [];
}

export async function submitHostelAttendance(input: {
  building: string;
  date: string;
  records: { student: string; status: HostelNightStatus; remarks?: string }[];
}) {
  const res = await apiFetch<{ marked: number }>("/api/hostel/attendance/bulk", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { marked: number };
}

export interface HostelAttendanceHistory {
  records: { date: string; status: HostelNightStatus; remarks?: string }[];
  percentage: number;
}

export async function fetchHostelAttendanceHistory(params: {
  studentId?: string;
  from: string;
  to: string;
}) {
  const searchParams = new URLSearchParams();
  searchParams.set("from", params.from);
  searchParams.set("to", params.to);
  if (params.studentId) searchParams.set("studentId", params.studentId);

  const res = await apiFetch<HostelAttendanceHistory>(
    `/api/hostel/attendance/history?${searchParams.toString()}`
  );
  return res.data as HostelAttendanceHistory;
}

// --- Leave requests ---

export interface LeaveRequestItem {
  id: string;
  student: { _id: string; name: string; admissionNumber: string; photoUrl?: string };
  requestedBy: { _id: string; name: string; role: string };
  fromDate: string;
  toDate: string;
  reason: string;
  status: LeaveRequestStatus;
  reviewedBy?: { _id: string; name: string };
  reviewNote?: string;
  createdAt: string;
}

export async function fetchLeaveRequests(status?: string) {
  const res = await apiFetch<LeaveRequestItem[]>(
    `/api/hostel/leave-requests${status ? `?status=${status}` : ""}`
  );
  return res.data ?? [];
}

export async function createLeaveRequestRequest(input: {
  student: string;
  fromDate: string;
  toDate: string;
  reason: string;
}) {
  const res = await apiFetch<{ id: string }>("/api/hostel/leave-requests", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function reviewLeaveRequestRequest(
  id: string,
  input: { status: "approved" | "rejected"; reviewNote?: string }
) {
  await apiFetch<{ id: string }>(`/api/hostel/leave-requests/${id}/review`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

// --- Gate passes ---

export interface GatePassItem {
  id: string;
  student: { _id: string; name: string; admissionNumber: string; photoUrl?: string };
  purpose: string;
  outTime: string;
  expectedInTime: string;
  actualInTime?: string;
  status: GatePassStatus;
  issuedBy: { _id: string; name: string };
}

export async function fetchGatePasses(status?: string) {
  const res = await apiFetch<GatePassItem[]>(
    `/api/hostel/gate-passes${status ? `?status=${status}` : ""}`
  );
  return res.data ?? [];
}

export async function issueGatePassRequest(input: {
  student: string;
  purpose: string;
  expectedInTime: string;
}) {
  const res = await apiFetch<{ id: string }>("/api/hostel/gate-passes", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function returnGatePassRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/hostel/gate-passes/${id}/return`, { method: "POST" });
}

// --- Visitor log ---

export interface VisitorLogItem {
  id: string;
  student: { _id: string; name: string; admissionNumber: string; photoUrl?: string };
  visitorName: string;
  visitorPhone: string;
  relation: string;
  purpose: string;
  checkInTime: string;
  checkOutTime?: string;
  approvedBy: { _id: string; name: string };
}

export async function fetchVisitorLogs() {
  const res = await apiFetch<VisitorLogItem[]>("/api/hostel/visitor-logs");
  return res.data ?? [];
}

export async function createVisitorLogRequest(input: {
  student: string;
  visitorName: string;
  visitorPhone: string;
  relation: string;
  purpose: string;
}) {
  const res = await apiFetch<{ id: string }>("/api/hostel/visitor-logs", {
    method: "POST",
    body: JSON.stringify(input),
  });
  return res.data as { id: string };
}

export async function checkOutVisitorRequest(id: string) {
  await apiFetch<{ id: string }>(`/api/hostel/visitor-logs/${id}/checkout`, { method: "POST" });
}
