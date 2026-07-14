export const GENDERS = ["male", "female", "other"] as const;
export type Gender = (typeof GENDERS)[number];

export const BLOOD_GROUPS = [
  "A+",
  "A-",
  "B+",
  "B-",
  "AB+",
  "AB-",
  "O+",
  "O-",
] as const;
export type BloodGroup = (typeof BLOOD_GROUPS)[number];

export const HOUSES = ["Aravalli", "Nilgiri", "Shivalik", "Vindhyachal"] as const;
export type House = (typeof HOUSES)[number];

export const STUDENT_STATUSES = [
  "active",
  "inactive",
  "alumni",
  "transferred",
] as const;
export type StudentStatus = (typeof STUDENT_STATUSES)[number];

export const STAFF_STATUSES = ["active", "inactive", "on_leave", "resigned"] as const;
export type StaffStatus = (typeof STAFF_STATUSES)[number];

export const NOTIFICATION_TYPES = [
  "info",
  "success",
  "warning",
  "urgent",
] as const;
export type NotificationType = (typeof NOTIFICATION_TYPES)[number];

export const NOTIFICATION_AUDIENCE_SCOPES = [
  "all",
  "roles",
  "class",
  "section",
  "users",
] as const;
export type NotificationAudienceScope = (typeof NOTIFICATION_AUDIENCE_SCOPES)[number];
