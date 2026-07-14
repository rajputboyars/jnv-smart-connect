export const ROLES = {
  SUPER_ADMIN: "super_admin",
  PRINCIPAL: "principal",
  VICE_PRINCIPAL: "vice_principal",
  TEACHER: "teacher",
  HOSTEL_WARDEN: "hostel_warden",
  ACCOUNTANT: "accountant",
  LIBRARIAN: "librarian",
  PARENT: "parent",
  STUDENT: "student",
} as const;

export type Role = (typeof ROLES)[keyof typeof ROLES];

export const ALL_ROLES: Role[] = Object.values(ROLES);

export const STAFF_ROLES: Role[] = [
  ROLES.SUPER_ADMIN,
  ROLES.PRINCIPAL,
  ROLES.VICE_PRINCIPAL,
  ROLES.TEACHER,
  ROLES.HOSTEL_WARDEN,
  ROLES.ACCOUNTANT,
  ROLES.LIBRARIAN,
];

export const ROLE_LABELS: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "Super Admin",
  [ROLES.PRINCIPAL]: "Principal",
  [ROLES.VICE_PRINCIPAL]: "Vice Principal",
  [ROLES.TEACHER]: "Teacher",
  [ROLES.HOSTEL_WARDEN]: "Hostel Warden",
  [ROLES.ACCOUNTANT]: "Accountant",
  [ROLES.LIBRARIAN]: "Librarian",
  [ROLES.PARENT]: "Parent",
  [ROLES.STUDENT]: "Student",
};

/** Default landing dashboard route per role, after login. */
export const ROLE_HOME: Record<Role, string> = {
  [ROLES.SUPER_ADMIN]: "/dashboard",
  [ROLES.PRINCIPAL]: "/dashboard",
  [ROLES.VICE_PRINCIPAL]: "/dashboard",
  [ROLES.TEACHER]: "/dashboard",
  [ROLES.HOSTEL_WARDEN]: "/dashboard",
  [ROLES.ACCOUNTANT]: "/dashboard",
  [ROLES.LIBRARIAN]: "/dashboard",
  [ROLES.PARENT]: "/dashboard",
  [ROLES.STUDENT]: "/dashboard",
};

export function isRole(value: unknown): value is Role {
  return typeof value === "string" && (ALL_ROLES as string[]).includes(value);
}
