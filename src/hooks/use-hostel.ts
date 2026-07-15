"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { toast } from "sonner";
import {
  fetchHostelBuildings,
  createHostelBuildingRequest,
  updateHostelBuildingRequest,
  deleteHostelBuildingRequest,
  fetchHostelRooms,
  createHostelRoomRequest,
  deleteHostelRoomRequest,
  fetchHostelAllocations,
  allocateBedRequest,
  vacateBedRequest,
  fetchHostelRoster,
  submitHostelAttendance,
  fetchHostelAttendanceHistory,
  fetchLeaveRequests,
  createLeaveRequestRequest,
  reviewLeaveRequestRequest,
  fetchGatePasses,
  issueGatePassRequest,
  returnGatePassRequest,
  fetchVisitorLogs,
  createVisitorLogRequest,
  checkOutVisitorRequest,
  type HostelBuildingInput,
} from "@/services/hostel.service";
import { ApiClientError } from "@/lib/api-client";

function handleError(error: unknown) {
  toast.error(error instanceof ApiClientError ? error.message : "Something went wrong");
}

// --- Buildings ---

export function useHostelBuildings() {
  return useQuery({ queryKey: ["hostel", "buildings"], queryFn: fetchHostelBuildings });
}

export function useCreateHostelBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHostelBuildingRequest,
    onSuccess: () => {
      toast.success("Building created");
      queryClient.invalidateQueries({ queryKey: ["hostel", "buildings"] });
    },
    onError: handleError,
  });
}

export function useUpdateHostelBuilding(id: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (input: Partial<HostelBuildingInput>) => updateHostelBuildingRequest(id, input),
    onSuccess: () => {
      toast.success("Building updated");
      queryClient.invalidateQueries({ queryKey: ["hostel", "buildings"] });
    },
    onError: handleError,
  });
}

export function useDeleteHostelBuilding() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHostelBuildingRequest,
    onSuccess: () => {
      toast.success("Building removed");
      queryClient.invalidateQueries({ queryKey: ["hostel", "buildings"] });
    },
    onError: handleError,
  });
}

// --- Rooms ---

export function useHostelRooms() {
  return useQuery({ queryKey: ["hostel", "rooms"], queryFn: fetchHostelRooms });
}

export function useCreateHostelRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createHostelRoomRequest,
    onSuccess: () => {
      toast.success("Room created");
      queryClient.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel", "buildings"] });
    },
    onError: handleError,
  });
}

export function useDeleteHostelRoom() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: deleteHostelRoomRequest,
    onSuccess: () => {
      toast.success("Room removed");
      queryClient.invalidateQueries({ queryKey: ["hostel", "rooms"] });
      queryClient.invalidateQueries({ queryKey: ["hostel", "buildings"] });
    },
    onError: handleError,
  });
}

// --- Allocation ---

export function useHostelAllocations() {
  return useQuery({ queryKey: ["hostel", "allocations"], queryFn: fetchHostelAllocations });
}

export function useAllocateBed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: allocateBedRequest,
    onSuccess: () => {
      toast.success("Bed allocated");
      queryClient.invalidateQueries({ queryKey: ["hostel"] });
    },
    onError: handleError,
  });
}

export function useVacateBed() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: vacateBedRequest,
    onSuccess: () => {
      toast.success("Bed vacated");
      queryClient.invalidateQueries({ queryKey: ["hostel"] });
    },
    onError: handleError,
  });
}

// --- Night attendance ---

export function useHostelRoster(buildingId: string, date: string) {
  return useQuery({
    queryKey: ["hostel", "roster", buildingId, date],
    queryFn: () => fetchHostelRoster(buildingId, date),
    enabled: !!buildingId && !!date,
  });
}

export function useSubmitHostelAttendance() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: submitHostelAttendance,
    onSuccess: (result) => {
      toast.success(`Night attendance saved for ${result.marked} students`);
      queryClient.invalidateQueries({ queryKey: ["hostel", "roster"] });
    },
    onError: handleError,
  });
}

export function useHostelAttendanceHistory(params: { studentId?: string; from: string; to: string }) {
  return useQuery({
    queryKey: ["hostel", "history", params],
    queryFn: () => fetchHostelAttendanceHistory(params),
    enabled: !!params.from && !!params.to,
  });
}

// --- Leave requests ---

export function useLeaveRequests(status?: string) {
  return useQuery({ queryKey: ["hostel", "leave-requests", status], queryFn: () => fetchLeaveRequests(status) });
}

export function useCreateLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createLeaveRequestRequest,
    onSuccess: () => {
      toast.success("Leave request submitted");
      queryClient.invalidateQueries({ queryKey: ["hostel", "leave-requests"] });
    },
    onError: handleError,
  });
}

export function useReviewLeaveRequest() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...input }: { id: string; status: "approved" | "rejected"; reviewNote?: string }) =>
      reviewLeaveRequestRequest(id, input),
    onSuccess: () => {
      toast.success("Request reviewed");
      queryClient.invalidateQueries({ queryKey: ["hostel", "leave-requests"] });
    },
    onError: handleError,
  });
}

// --- Gate passes ---

export function useGatePasses(status?: string) {
  return useQuery({ queryKey: ["hostel", "gate-passes", status], queryFn: () => fetchGatePasses(status) });
}

export function useIssueGatePass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: issueGatePassRequest,
    onSuccess: () => {
      toast.success("Gate pass issued");
      queryClient.invalidateQueries({ queryKey: ["hostel", "gate-passes"] });
    },
    onError: handleError,
  });
}

export function useReturnGatePass() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: returnGatePassRequest,
    onSuccess: () => {
      toast.success("Marked returned");
      queryClient.invalidateQueries({ queryKey: ["hostel", "gate-passes"] });
    },
    onError: handleError,
  });
}

// --- Visitor log ---

export function useVisitorLogs() {
  return useQuery({ queryKey: ["hostel", "visitor-logs"], queryFn: fetchVisitorLogs });
}

export function useCreateVisitorLog() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: createVisitorLogRequest,
    onSuccess: () => {
      toast.success("Visitor logged");
      queryClient.invalidateQueries({ queryKey: ["hostel", "visitor-logs"] });
    },
    onError: handleError,
  });
}

export function useCheckOutVisitor() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: checkOutVisitorRequest,
    onSuccess: () => {
      toast.success("Visitor checked out");
      queryClient.invalidateQueries({ queryKey: ["hostel", "visitor-logs"] });
    },
    onError: handleError,
  });
}
