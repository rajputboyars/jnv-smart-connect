import { z } from "zod";
import { ATTENDANCE_STATUSES } from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const bulkStudentAttendanceSchema = z.object({
  class: objectId,
  section: objectId,
  date: z.string().min(1, "Date is required"),
  records: z
    .array(
      z.object({
        student: objectId,
        status: z.enum(ATTENDANCE_STATUSES),
        remarks: z.string().trim().optional().or(z.literal("")),
      })
    )
    .min(1, "At least one student record is required"),
});
export type BulkStudentAttendanceInput = z.infer<typeof bulkStudentAttendanceSchema>;

export const bulkTeacherAttendanceSchema = z.object({
  date: z.string().min(1, "Date is required"),
  records: z
    .array(
      z.object({
        teacher: objectId,
        status: z.enum(ATTENDANCE_STATUSES),
        remarks: z.string().trim().optional().or(z.literal("")),
      })
    )
    .min(1, "At least one teacher record is required"),
});
export type BulkTeacherAttendanceInput = z.infer<typeof bulkTeacherAttendanceSchema>;

export const attendanceRangeQuerySchema = z.object({
  from: z.string().min(1, "From date is required"),
  to: z.string().min(1, "To date is required"),
  classId: objectId.optional(),
  sectionId: objectId.optional(),
  studentId: objectId.optional(),
  teacherId: objectId.optional(),
});
export type AttendanceRangeQueryInput = z.infer<typeof attendanceRangeQuerySchema>;

export const createQrSessionSchema = z.object({
  class: objectId,
  section: objectId,
  subject: objectId.optional(),
  date: z.string().min(1, "Date is required"),
  period: z.number().min(1).max(12).optional(),
  expiresInMinutes: z.number().min(1).max(180),
});
export type CreateQrSessionInput = z.infer<typeof createQrSessionSchema>;
