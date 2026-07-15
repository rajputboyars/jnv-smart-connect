import { z } from "zod";
import { STAFF_STATUSES } from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const assignedClassSchema = z.object({
  class: objectId,
  section: objectId,
  subject: objectId,
});

export const createTeacherSchema = z.object({
  employeeId: z.string().trim().min(1, "Employee ID is required"),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  email: z.string().trim().min(1, "Email is required").email("Enter a valid email"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
  photoUrl: z.string().trim().optional().or(z.literal("")),
  qualification: z.string().trim().min(1, "Qualification is required"),
  designation: z.string().trim().optional().or(z.literal("")),
  subjects: z.array(objectId),
  assignedClasses: z.array(assignedClassSchema),
  experienceYears: z.number().min(0).max(60),
  joiningDate: z.string().min(1, "Joining date is required"),
  status: z.enum(STAFF_STATUSES),
});

export type CreateTeacherInput = z.infer<typeof createTeacherSchema>;

export const updateTeacherSchema = createTeacherSchema
  .omit({ email: true })
  .partial();
export type UpdateTeacherInput = z.infer<typeof updateTeacherSchema>;

export const teacherQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().default(""),
  status: z.enum(STAFF_STATUSES).optional(),
});

export type TeacherQueryInput = z.infer<typeof teacherQuerySchema>;
