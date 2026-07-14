import { z } from "zod";
import {
  BLOOD_GROUPS,
  GENDERS,
  HOUSES,
  STUDENT_STATUSES,
} from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

const addressSchema = z.object({
  line1: z.string().trim().optional().or(z.literal("")),
  line2: z.string().trim().optional().or(z.literal("")),
  village: z.string().trim().optional().or(z.literal("")),
  district: z.string().trim().optional().or(z.literal("")),
  state: z.string().trim().optional().or(z.literal("")),
  pincode: z.string().trim().optional().or(z.literal("")),
});

const guardianDetailsSchema = z.object({
  fatherName: z.string().trim().optional().or(z.literal("")),
  fatherPhone: z.string().trim().optional().or(z.literal("")),
  fatherOccupation: z.string().trim().optional().or(z.literal("")),
  motherName: z.string().trim().optional().or(z.literal("")),
  motherPhone: z.string().trim().optional().or(z.literal("")),
  motherOccupation: z.string().trim().optional().or(z.literal("")),
  guardianName: z.string().trim().optional().or(z.literal("")),
  guardianPhone: z.string().trim().optional().or(z.literal("")),
  guardianRelation: z.string().trim().optional().or(z.literal("")),
});

const emergencyContactSchema = z.object({
  name: z.string().trim().min(1, "Required"),
  relation: z.string().trim().min(1, "Required"),
  phone: z.string().trim().min(6, "Enter a valid phone number"),
});

const medicalInfoSchema = z.object({
  conditions: z.string().trim().optional().or(z.literal("")),
  allergies: z.string().trim().optional().or(z.literal("")),
  medications: z.string().trim().optional().or(z.literal("")),
  doctorName: z.string().trim().optional().or(z.literal("")),
  doctorPhone: z.string().trim().optional().or(z.literal("")),
});

export const createStudentSchema = z.object({
  admissionNumber: z.string().trim().min(1, "Admission number is required"),
  rollNumber: z.string().trim().optional().or(z.literal("")),
  aadhaarNumber: z
    .string()
    .trim()
    .regex(/^\d{12}$/, "Aadhaar must be 12 digits")
    .optional()
    .or(z.literal("")),
  name: z.string().trim().min(2, "Name must be at least 2 characters"),
  photoUrl: z.string().trim().optional().or(z.literal("")),
  dob: z.string().min(1, "Date of birth is required"),
  gender: z.enum(GENDERS),
  bloodGroup: z.enum(BLOOD_GROUPS).optional(),
  address: addressSchema.optional(),
  guardianDetails: guardianDetailsSchema.optional(),
  emergencyContact: emergencyContactSchema,
  previousSchool: z.string().trim().optional().or(z.literal("")),
  currentClass: objectId,
  section: objectId,
  house: z.enum(HOUSES).optional(),
  isHosteller: z.boolean(),
  medicalInfo: medicalInfoSchema.optional(),
  status: z.enum(STUDENT_STATUSES),
});

export type CreateStudentInput = z.infer<typeof createStudentSchema>;

export const updateStudentSchema = createStudentSchema.partial();
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;

export const studentQuerySchema = z.object({
  page: z.coerce.number().int().min(1).default(1),
  limit: z.coerce.number().int().min(1).max(100).default(10),
  search: z.string().trim().optional().default(""),
  status: z.enum(STUDENT_STATUSES).optional(),
  classId: objectId.optional(),
  sectionId: objectId.optional(),
});

export type StudentQueryInput = z.infer<typeof studentQuerySchema>;
