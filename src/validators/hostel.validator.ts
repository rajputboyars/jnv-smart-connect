import { z } from "zod";
import { HOSTEL_NIGHT_STATUSES, LEAVE_REQUEST_STATUSES } from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createHostelBuildingSchema = z.object({
  name: z.string().trim().min(1, "Name is required"),
  code: z.string().trim().min(1, "Code is required"),
  gender: z.enum(["boys", "girls", "mixed"]),
  warden: objectId.optional().or(z.literal("")),
  totalFloors: z.number().min(1).max(20),
});
export type CreateHostelBuildingInput = z.infer<typeof createHostelBuildingSchema>;
export const updateHostelBuildingSchema = createHostelBuildingSchema.partial();
export type UpdateHostelBuildingInput = z.infer<typeof updateHostelBuildingSchema>;

export const createHostelRoomSchema = z.object({
  building: objectId,
  roomNumber: z.string().trim().min(1, "Room number is required"),
  floor: z.number().min(0).max(20),
  bedCount: z.number().min(1).max(12),
});
export type CreateHostelRoomInput = z.infer<typeof createHostelRoomSchema>;
export const updateHostelRoomSchema = createHostelRoomSchema.partial();
export type UpdateHostelRoomInput = z.infer<typeof updateHostelRoomSchema>;

export const createAllocationSchema = z.object({
  student: objectId,
  room: objectId,
  bedNumber: z.number().min(1),
});
export type CreateAllocationInput = z.infer<typeof createAllocationSchema>;

export const bulkHostelAttendanceSchema = z.object({
  building: objectId,
  date: z.string().min(1, "Date is required"),
  records: z
    .array(
      z.object({
        student: objectId,
        status: z.enum(HOSTEL_NIGHT_STATUSES),
        remarks: z.string().trim().optional().or(z.literal("")),
      })
    )
    .min(1),
});
export type BulkHostelAttendanceInput = z.infer<typeof bulkHostelAttendanceSchema>;

export const createLeaveRequestSchema = z.object({
  student: objectId,
  fromDate: z.string().min(1, "From date is required"),
  toDate: z.string().min(1, "To date is required"),
  reason: z.string().trim().min(3, "Reason is required").max(500),
});
export type CreateLeaveRequestInput = z.infer<typeof createLeaveRequestSchema>;

export const reviewLeaveRequestSchema = z.object({
  status: z.enum(LEAVE_REQUEST_STATUSES),
  reviewNote: z.string().trim().max(500).optional().or(z.literal("")),
});
export type ReviewLeaveRequestInput = z.infer<typeof reviewLeaveRequestSchema>;

export const createGatePassSchema = z.object({
  student: objectId,
  leaveRequest: objectId.optional().or(z.literal("")),
  purpose: z.string().trim().min(3, "Purpose is required").max(300),
  expectedInTime: z.string().min(1, "Expected return time is required"),
});
export type CreateGatePassInput = z.infer<typeof createGatePassSchema>;

export const createVisitorLogSchema = z.object({
  student: objectId,
  visitorName: z.string().trim().min(1, "Visitor name is required"),
  visitorPhone: z.string().trim().min(6, "Enter a valid phone number"),
  relation: z.string().trim().min(1, "Relation is required"),
  purpose: z.string().trim().min(3, "Purpose is required").max(300),
});
export type CreateVisitorLogInput = z.infer<typeof createVisitorLogSchema>;
