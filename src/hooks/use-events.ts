"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as svc from "@/services/event.service";
import { ApiClientError } from "@/lib/api-client";
import type { EventType, EventParticipantRole } from "@/models/enums";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

export function useEvents(type?: EventType) {
  return useQuery({ queryKey: ["events", "list", type], queryFn: () => svc.fetchEvents(type) });
}
export function useCreateEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createEventRequest,
    onSuccess: () => {
      toast.success("Event created");
      qc.invalidateQueries({ queryKey: ["events", "list"] });
    },
    onError: handleError,
  });
}

export function useEventParticipants(eventId: string) {
  return useQuery({
    queryKey: ["events", "participants", eventId],
    queryFn: () => svc.fetchEventParticipants(eventId),
    enabled: !!eventId,
  });
}
export function useAddEventParticipant(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { student: string; role: EventParticipantRole; position?: string; remarks?: string }) =>
      svc.addEventParticipantRequest(eventId, input),
    onSuccess: () => {
      toast.success("Participant added");
      qc.invalidateQueries({ queryKey: ["events", "participants", eventId] });
    },
    onError: handleError,
  });
}

export function useEventPhotos(eventId: string) {
  return useQuery({
    queryKey: ["events", "photos", eventId],
    queryFn: () => svc.fetchEventPhotos(eventId),
    enabled: !!eventId,
  });
}
export function useAddEventPhoto(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { url: string; caption?: string }) => svc.addEventPhotoRequest(eventId, input),
    onSuccess: () => {
      toast.success("Photo added");
      qc.invalidateQueries({ queryKey: ["events", "photos", eventId] });
    },
    onError: handleError,
  });
}
export function useDeleteEventPhoto(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (photoId: string) => svc.deleteEventPhotoRequest(eventId, photoId),
    onSuccess: () => {
      toast.success("Photo removed");
      qc.invalidateQueries({ queryKey: ["events", "photos", eventId] });
    },
    onError: handleError,
  });
}

export function useCertificates(eventId: string) {
  return useQuery({
    queryKey: ["events", "certificates", eventId],
    queryFn: () => svc.fetchCertificates(eventId),
    enabled: !!eventId,
  });
}
export function useIssueCertificate(eventId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (input: { participant: string; title: string }) => svc.issueCertificateRequest(eventId, input),
    onSuccess: () => {
      toast.success("Certificate issued");
      qc.invalidateQueries({ queryKey: ["events", "certificates", eventId] });
    },
    onError: handleError,
  });
}
