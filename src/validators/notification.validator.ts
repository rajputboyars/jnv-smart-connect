import { z } from "zod";
import { NOTIFICATION_AUDIENCE_SCOPES, NOTIFICATION_TYPES } from "@/models/enums";
import { ALL_ROLES, type Role } from "@/types/roles";

const ROLE_TUPLE = ALL_ROLES as [Role, ...Role[]];

export const createNotificationSchema = z.object({
  title: z.string().trim().min(3).max(150),
  message: z.string().trim().min(3).max(2000),
  type: z.enum(NOTIFICATION_TYPES),
  audienceScope: z.enum(NOTIFICATION_AUDIENCE_SCOPES),
  audienceRoles: z.array(z.enum(ROLE_TUPLE)),
});

export type CreateNotificationInput = z.infer<typeof createNotificationSchema>;
