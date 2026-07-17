import { apiFetch } from "@/lib/api-client";
import type { MaintenanceCategory, MaintenancePriority, MaintenanceStatus } from "@/models/enums";

export interface TechnicianItem {
  _id: string;
  name: string;
  phone: string;
  email?: string;
  specialization: MaintenanceCategory;
}
export async function fetchTechnicians(specialization?: MaintenanceCategory) {
  const params = specialization ? `?specialization=${specialization}` : "";
  const res = await apiFetch<TechnicianItem[]>(`/api/maintenance/technicians${params}`);
  return res.data ?? [];
}
export async function createTechnicianRequest(input: {
  name: string;
  phone: string;
  email?: string;
  specialization: MaintenanceCategory;
}) {
  return apiFetch<{ id: string }>("/api/maintenance/technicians", { method: "POST", body: JSON.stringify(input) });
}

export interface TimelineEntryDto {
  status: MaintenanceStatus;
  note?: string;
  by: { name: string };
  at: string;
}
export interface MaintenanceTicketItem {
  _id: string;
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  location: string;
  status: MaintenanceStatus;
  raisedBy: { name: string };
  assignedTechnician?: { _id: string; name: string; phone: string; specialization: MaintenanceCategory };
  timeline: TimelineEntryDto[];
  resolutionNote?: string;
  resolvedAt?: string;
  createdAt: string;
}
export async function fetchMaintenanceTickets(filters: { status?: string; category?: string }) {
  const searchParams = new URLSearchParams();
  Object.entries(filters).forEach(([key, value]) => {
    if (value) searchParams.set(key, value);
  });
  const res = await apiFetch<MaintenanceTicketItem[]>(`/api/maintenance/tickets?${searchParams.toString()}`);
  return res.data ?? [];
}
export async function createMaintenanceTicketRequest(input: {
  title: string;
  description: string;
  category: MaintenanceCategory;
  priority: MaintenancePriority;
  location: string;
}) {
  return apiFetch<{ id: string }>("/api/maintenance/tickets", { method: "POST", body: JSON.stringify(input) });
}
export async function assignTechnicianRequest(id: string, technician: string) {
  return apiFetch<{ id: string; status: MaintenanceStatus }>(`/api/maintenance/tickets/${id}/assign`, {
    method: "POST",
    body: JSON.stringify({ technician }),
  });
}
export async function updateTicketStatusRequest(id: string, status: MaintenanceStatus, note?: string) {
  return apiFetch<{ id: string; status: MaintenanceStatus }>(`/api/maintenance/tickets/${id}/status`, {
    method: "POST",
    body: JSON.stringify({ status, note }),
  });
}
