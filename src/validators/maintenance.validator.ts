import { z } from "zod";
import { MAINTENANCE_CATEGORIES, MAINTENANCE_PRIORITIES, MAINTENANCE_STATUSES } from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createTechnicianSchema = z.object({
  name: z.string().trim().min(2, "Name is required"),
  phone: z.string().trim().min(5, "Phone is required"),
  email: z.string().trim().email().optional().or(z.literal("")),
  specialization: z.enum(MAINTENANCE_CATEGORIES),
});
export type CreateTechnicianInput = z.infer<typeof createTechnicianSchema>;

export const createMaintenanceTicketSchema = z.object({
  title: z.string().trim().min(3, "Title is required").max(200),
  description: z.string().trim().min(3, "Description is required").max(1000),
  category: z.enum(MAINTENANCE_CATEGORIES),
  priority: z.enum(MAINTENANCE_PRIORITIES).default("medium"),
  location: z.string().trim().min(1, "Location is required"),
});
export type CreateMaintenanceTicketInput = z.infer<typeof createMaintenanceTicketSchema>;

export const assignTechnicianSchema = z.object({
  technician: objectId,
});
export type AssignTechnicianInput = z.infer<typeof assignTechnicianSchema>;

export const updateTicketStatusSchema = z.object({
  status: z.enum(MAINTENANCE_STATUSES),
  note: z.string().trim().max(500).optional().or(z.literal("")),
});
export type UpdateTicketStatusInput = z.infer<typeof updateTicketStatusSchema>;
