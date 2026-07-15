import { z } from "zod";
import { MEDICINE_ROUTES } from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createMedicineLogSchema = z.object({
  student: objectId,
  medicineName: z.string().trim().min(1, "Medicine name is required"),
  dosage: z.string().trim().min(1, "Dosage is required"),
  route: z.enum(MEDICINE_ROUTES),
  notes: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreateMedicineLogInput = z.infer<typeof createMedicineLogSchema>;

export const createDoctorVisitSchema = z.object({
  student: objectId,
  reason: z.string().trim().min(3, "Reason is required").max(300),
  diagnosis: z.string().trim().max(500).optional().or(z.literal("")),
  prescription: z.string().trim().max(500).optional().or(z.literal("")),
  doctorName: z.string().trim().min(1, "Doctor name is required"),
  followUpDate: z.string().optional().or(z.literal("")),
  notifyParent: z.boolean(),
});
export type CreateDoctorVisitInput = z.infer<typeof createDoctorVisitSchema>;
