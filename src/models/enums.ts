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

export const ATTENDANCE_STATUSES = [
  "present",
  "absent",
  "late",
  "half_day",
  "leave",
] as const;
export type AttendanceStatus = (typeof ATTENDANCE_STATUSES)[number];

export const ATTENDANCE_ENTITY_TYPES = ["student", "teacher"] as const;
export type AttendanceEntityType = (typeof ATTENDANCE_ENTITY_TYPES)[number];

export const ATTENDANCE_METHODS = ["manual", "qr"] as const;
export type AttendanceMethod = (typeof ATTENDANCE_METHODS)[number];

export const HOSTEL_NIGHT_STATUSES = ["present", "absent", "on_leave"] as const;
export type HostelNightStatus = (typeof HOSTEL_NIGHT_STATUSES)[number];

export const HOSTEL_ALLOCATION_STATUSES = ["active", "vacated"] as const;
export type HostelAllocationStatus = (typeof HOSTEL_ALLOCATION_STATUSES)[number];

export const LEAVE_REQUEST_STATUSES = ["pending", "approved", "rejected", "cancelled"] as const;
export type LeaveRequestStatus = (typeof LEAVE_REQUEST_STATUSES)[number];

export const GATE_PASS_STATUSES = ["issued", "returned", "overdue"] as const;
export type GatePassStatus = (typeof GATE_PASS_STATUSES)[number];

export const MEDICINE_ROUTES = ["oral", "topical", "injection", "other"] as const;
export type MedicineRoute = (typeof MEDICINE_ROUTES)[number];

export const BOOK_ISSUE_STATUSES = ["issued", "returned", "lost"] as const;
export type BookIssueStatus = (typeof BOOK_ISSUE_STATUSES)[number];
