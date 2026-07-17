"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import * as svc from "@/services/maintenance.service";
import { ApiClientError } from "@/lib/api-client";
import type { MaintenanceCategory, MaintenanceStatus } from "@/models/enums";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

export function useTechnicians(specialization?: MaintenanceCategory) {
  return useQuery({
    queryKey: ["maintenance", "technicians", specialization],
    queryFn: () => svc.fetchTechnicians(specialization),
  });
}
export function useCreateTechnician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createTechnicianRequest,
    onSuccess: () => {
      toast.success("Technician added");
      qc.invalidateQueries({ queryKey: ["maintenance", "technicians"] });
    },
    onError: handleError,
  });
}

export function useMaintenanceTickets(filters: { status?: string; category?: string }) {
  return useQuery({
    queryKey: ["maintenance", "tickets", filters],
    queryFn: () => svc.fetchMaintenanceTickets(filters),
  });
}
export function useCreateMaintenanceTicket() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: svc.createMaintenanceTicketRequest,
    onSuccess: () => {
      toast.success("Ticket submitted");
      qc.invalidateQueries({ queryKey: ["maintenance", "tickets"] });
    },
    onError: handleError,
  });
}
export function useAssignTechnician() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, technician }: { id: string; technician: string }) => svc.assignTechnicianRequest(id, technician),
    onSuccess: () => {
      toast.success("Technician assigned");
      qc.invalidateQueries({ queryKey: ["maintenance", "tickets"] });
    },
    onError: handleError,
  });
}
export function useUpdateTicketStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status, note }: { id: string; status: MaintenanceStatus; note?: string }) =>
      svc.updateTicketStatusRequest(id, status, note),
    onSuccess: () => {
      toast.success("Ticket updated");
      qc.invalidateQueries({ queryKey: ["maintenance", "tickets"] });
    },
    onError: handleError,
  });
}
