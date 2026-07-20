import { apiFetch } from "@/lib/api-client";
import type { EventType, EventParticipantRole } from "@/models/enums";

export interface EventItem {
  _id: string;
  title: string;
  type: EventType;
  description?: string;
  venue: string;
  startDate: string;
  endDate: string;
  organizer: { name: string };
}
export async function fetchEvents(type?: EventType) {
  const params = type ? `?type=${type}` : "";
  const res = await apiFetch<EventItem[]>(`/api/events${params}`);
  return res.data ?? [];
}
export async function createEventRequest(input: {
  title: string;
  type: EventType;
  description?: string;
  venue: string;
  startDate: string;
  endDate: string;
}) {
  return apiFetch<{ id: string }>("/api/events", { method: "POST", body: JSON.stringify(input) });
}

export interface EventParticipantItem {
  _id: string;
  student: { _id: string; name: string; admissionNumber: string; currentClass?: { name: string }; section?: { name: string } };
  role: EventParticipantRole;
  position?: string;
  remarks?: string;
}
export async function fetchEventParticipants(eventId: string) {
  const res = await apiFetch<EventParticipantItem[]>(`/api/events/${eventId}/participants`);
  return res.data ?? [];
}
export async function addEventParticipantRequest(
  eventId: string,
  input: { student: string; role: EventParticipantRole; position?: string; remarks?: string }
) {
  return apiFetch<{ id: string }>(`/api/events/${eventId}/participants`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}

export interface EventPhotoItem {
  _id: string;
  url: string;
  caption?: string;
  uploadedBy: { name: string };
  createdAt: string;
}
export async function fetchEventPhotos(eventId: string) {
  const res = await apiFetch<EventPhotoItem[]>(`/api/events/${eventId}/photos`);
  return res.data ?? [];
}
export async function addEventPhotoRequest(eventId: string, input: { url: string; caption?: string }) {
  return apiFetch<{ id: string }>(`/api/events/${eventId}/photos`, { method: "POST", body: JSON.stringify(input) });
}
export async function deleteEventPhotoRequest(eventId: string, photoId: string) {
  await apiFetch(`/api/events/${eventId}/photos/${photoId}`, { method: "DELETE" });
}

export interface CertificateItem {
  _id: string;
  title: string;
  issuedAt: string;
  issuedBy: { name: string };
  event: { _id: string; title: string; startDate: string };
  participant: { _id: string; student: { name: string; admissionNumber: string } };
  school?: { name: string };
}
export async function fetchCertificates(eventId: string) {
  const res = await apiFetch<CertificateItem[]>(`/api/events/${eventId}/certificates`);
  return res.data ?? [];
}
export async function issueCertificateRequest(eventId: string, input: { participant: string; title: string }) {
  return apiFetch<{ id: string }>(`/api/events/${eventId}/certificates`, {
    method: "POST",
    body: JSON.stringify(input),
  });
}
