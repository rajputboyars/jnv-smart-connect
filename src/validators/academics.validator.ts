import { z } from "zod";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createAcademicYearSchema = z
  .object({
    name: z.string().trim().min(4, "e.g. 2025-2026"),
    startDate: z.string().min(1, "Start date is required"),
    endDate: z.string().min(1, "End date is required"),
    isActive: z.boolean(),
  })
  .refine((data) => new Date(data.endDate) > new Date(data.startDate), {
    message: "End date must be after start date",
    path: ["endDate"],
  });
export type CreateAcademicYearInput = z.infer<typeof createAcademicYearSchema>;

export const updateAcademicYearSchema = z.object({
  name: z.string().trim().min(4).optional(),
  startDate: z.string().min(1).optional(),
  endDate: z.string().min(1).optional(),
  isActive: z.boolean().optional(),
});
export type UpdateAcademicYearInput = z.infer<typeof updateAcademicYearSchema>;

export const createClassSchema = z.object({
  name: z.string().trim().min(1, "Class name is required"),
  numericLevel: z.number().min(1).max(12),
  academicYear: objectId,
  subjects: z.array(objectId),
});
export type CreateClassInput = z.infer<typeof createClassSchema>;

export const updateClassSchema = createClassSchema.partial();
export type UpdateClassInput = z.infer<typeof updateClassSchema>;

export const createSectionSchema = z.object({
  name: z.string().trim().min(1, "Section name is required"),
  class: objectId,
  academicYear: objectId,
  capacity: z.number().min(1).max(200),
  classTeacher: objectId.optional().or(z.literal("")),
});
export type CreateSectionInput = z.infer<typeof createSectionSchema>;

export const updateSectionSchema = z.object({
  name: z.string().trim().min(1).optional(),
  capacity: z.number().min(1).max(200).optional(),
  classTeacher: objectId.optional().or(z.literal("")),
});
export type UpdateSectionInput = z.infer<typeof updateSectionSchema>;

export const createSubjectSchema = z.object({
  name: z.string().trim().min(1, "Subject name is required"),
  code: z.string().trim().min(1, "Subject code is required"),
  type: z.enum(["core", "elective", "co_curricular"]),
});
export type CreateSubjectInput = z.infer<typeof createSubjectSchema>;

export const updateSubjectSchema = createSubjectSchema.partial();
export type UpdateSubjectInput = z.infer<typeof updateSubjectSchema>;
