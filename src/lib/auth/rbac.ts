import { ROLES, type Role } from "@/types/roles";

export const PERMISSIONS = {
  DASHBOARD_VIEW: "dashboard:view",

  USERS_MANAGE: "users:manage",

  STUDENTS_VIEW: "students:view",
  STUDENTS_CREATE: "students:create",
  STUDENTS_UPDATE: "students:update",
  STUDENTS_DELETE: "students:delete",

  TEACHERS_VIEW: "teachers:view",
  TEACHERS_CREATE: "teachers:create",
  TEACHERS_UPDATE: "teachers:update",
  TEACHERS_DELETE: "teachers:delete",

  PARENTS_VIEW: "parents:view",
  PARENTS_MANAGE: "parents:manage",

  ACADEMICS_MANAGE: "academics:manage", // classes, sections, subjects, academic years

  ATTENDANCE_VIEW: "attendance:view",
  ATTENDANCE_MARK: "attendance:mark",
  STAFF_ATTENDANCE_MARK: "attendance:mark_staff",

  HOMEWORK_VIEW: "homework:view",
  HOMEWORK_MANAGE: "homework:manage",

  EXAMS_VIEW: "exams:view",
  EXAMS_MANAGE: "exams:manage",

  LIBRARY_VIEW: "library:view",
  LIBRARY_MANAGE: "library:manage",

  HOSTEL_VIEW: "hostel:view",
  HOSTEL_MANAGE: "hostel:manage",

  HEALTH_VIEW: "health:view",
  HEALTH_MANAGE: "health:manage",

  ACCOUNTS_MANAGE: "accounts:manage",

  NOTIFICATIONS_VIEW: "notifications:view",
  NOTIFICATIONS_SEND: "notifications:send",

  ACTIVITY_LOGS_VIEW: "activity_logs:view",

  SCHOOL_SETTINGS_MANAGE: "school_settings:manage",
} as const;

export type Permission = (typeof PERMISSIONS)[keyof typeof PERMISSIONS];

const ALL_PERMISSIONS = Object.values(PERMISSIONS);

export const ROLE_PERMISSIONS: Record<Role, Permission[]> = {
  [ROLES.SUPER_ADMIN]: ALL_PERMISSIONS,

  [ROLES.PRINCIPAL]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.STUDENTS_DELETE,
    PERMISSIONS.TEACHERS_VIEW,
    PERMISSIONS.TEACHERS_CREATE,
    PERMISSIONS.TEACHERS_UPDATE,
    PERMISSIONS.TEACHERS_DELETE,
    PERMISSIONS.PARENTS_VIEW,
    PERMISSIONS.PARENTS_MANAGE,
    PERMISSIONS.ACADEMICS_MANAGE,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.STAFF_ATTENDANCE_MARK,
    PERMISSIONS.HOMEWORK_VIEW,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.EXAMS_MANAGE,
    PERMISSIONS.LIBRARY_VIEW,
    PERMISSIONS.LIBRARY_MANAGE,
    PERMISSIONS.HOSTEL_VIEW,
    PERMISSIONS.HOSTEL_MANAGE,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.HEALTH_MANAGE,
    PERMISSIONS.ACCOUNTS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
    PERMISSIONS.ACTIVITY_LOGS_VIEW,
    PERMISSIONS.SCHOOL_SETTINGS_MANAGE,
  ],

  [ROLES.VICE_PRINCIPAL]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.STUDENTS_CREATE,
    PERMISSIONS.STUDENTS_UPDATE,
    PERMISSIONS.TEACHERS_VIEW,
    PERMISSIONS.TEACHERS_UPDATE,
    PERMISSIONS.PARENTS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.STAFF_ATTENDANCE_MARK,
    PERMISSIONS.HOMEWORK_VIEW,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.LIBRARY_VIEW,
    PERMISSIONS.HOSTEL_VIEW,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
    PERMISSIONS.NOTIFICATIONS_SEND,
  ],

  [ROLES.TEACHER]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.ATTENDANCE_MARK,
    PERMISSIONS.HOMEWORK_VIEW,
    PERMISSIONS.HOMEWORK_MANAGE,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.LIBRARY_VIEW,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [ROLES.HOSTEL_WARDEN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.HOSTEL_VIEW,
    PERMISSIONS.HOSTEL_MANAGE,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.HEALTH_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [ROLES.ACCOUNTANT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.ACCOUNTS_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [ROLES.LIBRARIAN]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.STUDENTS_VIEW,
    PERMISSIONS.LIBRARY_VIEW,
    PERMISSIONS.LIBRARY_MANAGE,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [ROLES.PARENT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.HOMEWORK_VIEW,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.LIBRARY_VIEW,
    PERMISSIONS.HOSTEL_VIEW,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],

  [ROLES.STUDENT]: [
    PERMISSIONS.DASHBOARD_VIEW,
    PERMISSIONS.LIBRARY_VIEW,
    PERMISSIONS.HOSTEL_VIEW,
    PERMISSIONS.HEALTH_VIEW,
    PERMISSIONS.ATTENDANCE_VIEW,
    PERMISSIONS.HOMEWORK_VIEW,
    PERMISSIONS.EXAMS_VIEW,
    PERMISSIONS.NOTIFICATIONS_VIEW,
  ],
};

export function can(role: Role, permission: Permission): boolean {
  return ROLE_PERMISSIONS[role]?.includes(permission) ?? false;
}

export function canAny(role: Role, permissions: Permission[]): boolean {
  return permissions.some((permission) => can(role, permission));
}

/**
 * Route-prefix -> permission(s) map consumed by proxy.ts for optimistic
 * redirects, and reusable by server components for defense in depth. When an
 * array is given, holding any one of the permissions is enough.
 */
export const ROUTE_PERMISSIONS: { prefix: string; permission: Permission | Permission[] }[] = [
  { prefix: "/dashboard/students", permission: PERMISSIONS.STUDENTS_VIEW },
  { prefix: "/dashboard/teachers", permission: PERMISSIONS.TEACHERS_VIEW },
  { prefix: "/dashboard/parents", permission: PERMISSIONS.PARENTS_VIEW },
  { prefix: "/dashboard/academics", permission: PERMISSIONS.ACADEMICS_MANAGE },
  { prefix: "/dashboard/attendance", permission: PERMISSIONS.ATTENDANCE_VIEW },
  { prefix: "/dashboard/homework", permission: PERMISSIONS.HOMEWORK_VIEW },
  { prefix: "/dashboard/exams", permission: PERMISSIONS.EXAMS_VIEW },
  { prefix: "/dashboard/library", permission: [PERMISSIONS.LIBRARY_VIEW, PERMISSIONS.LIBRARY_MANAGE] },
  { prefix: "/dashboard/hostel", permission: [PERMISSIONS.HOSTEL_VIEW, PERMISSIONS.HOSTEL_MANAGE] },
  { prefix: "/dashboard/health", permission: [PERMISSIONS.HEALTH_VIEW, PERMISSIONS.HEALTH_MANAGE] },
  { prefix: "/dashboard/accounts", permission: PERMISSIONS.ACCOUNTS_MANAGE },
  { prefix: "/dashboard/notifications", permission: PERMISSIONS.NOTIFICATIONS_VIEW },
  { prefix: "/dashboard/activity-logs", permission: PERMISSIONS.ACTIVITY_LOGS_VIEW },
  { prefix: "/dashboard/settings", permission: PERMISSIONS.SCHOOL_SETTINGS_MANAGE },
];

export function getRequiredPermissionsForPath(pathname: string): Permission[] | null {
  const match = ROUTE_PERMISSIONS.find((route) => pathname.startsWith(route.prefix));
  if (!match) return null;
  return Array.isArray(match.permission) ? match.permission : [match.permission];
}
