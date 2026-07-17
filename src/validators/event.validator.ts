import { z } from "zod";
import { EVENT_TYPES, EVENT_PARTICIPANT_ROLES } from "@/models/enums";

const objectId = z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid id");

export const createEventSchema = z.object({
  title: z.string().trim().min(2, "Title is required").max(200),
  type: z.enum(EVENT_TYPES),
  description: z.string().trim().max(1000).optional().or(z.literal("")),
  venue: z.string().trim().min(1, "Venue is required"),
  startDate: z.string().min(1, "Start date is required"),
  endDate: z.string().min(1, "End date is required"),
});
export type CreateEventInput = z.infer<typeof createEventSchema>;

export const createEventParticipantSchema = z.object({
  event: objectId,
  student: objectId,
  role: z.enum(EVENT_PARTICIPANT_ROLES).default("participant"),
  position: z.string().trim().max(100).optional().or(z.literal("")),
  remarks: z.string().trim().max(500).optional().or(z.literal("")),
});
export type CreateEventParticipantInput = z.infer<typeof createEventParticipantSchema>;

export const createEventPhotoSchema = z.object({
  event: objectId,
  url: z.string().trim().min(1, "Photo URL is required"),
  caption: z.string().trim().max(300).optional().or(z.literal("")),
});
export type CreateEventPhotoInput = z.infer<typeof createEventPhotoSchema>;

export const issueCertificateSchema = z.object({
  event: objectId,
  participant: objectId,
  title: z.string().trim().min(2, "Certificate title is required").max(200),
});
export type IssueCertificateInput = z.infer<typeof issueCertificateSchema>;
