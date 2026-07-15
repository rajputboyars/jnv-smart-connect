import { describe, expect, it } from "vitest";
import { can, canAny, getRequiredPermissionsForPath, PERMISSIONS, ROLE_PERMISSIONS } from "./rbac";
import { ALL_ROLES } from "@/types/roles";
import { ROLES } from "@/types/roles";

describe("rbac", () => {
  it("grants Super Admin every permission that exists", () => {
    const allPermissions = Object.values(PERMISSIONS);
    for (const permission of allPermissions) {
      expect(can(ROLES.SUPER_ADMIN, permission)).toBe(true);
    }
  });

  it("denies a Student management permissions they should never hold", () => {
    expect(can(ROLES.STUDENT, PERMISSIONS.STUDENTS_DELETE)).toBe(false);
    expect(can(ROLES.STUDENT, PERMISSIONS.HOSTEL_MANAGE)).toBe(false);
    expect(can(ROLES.STUDENT, PERMISSIONS.USERS_MANAGE)).toBe(false);
  });

  it("every role in ROLE_PERMISSIONS is a real role and vice versa", () => {
    expect(Object.keys(ROLE_PERMISSIONS).sort()).toEqual([...ALL_ROLES].sort());
  });

  it("canAny is true if the role holds at least one of the listed permissions", () => {
    expect(canAny(ROLES.LIBRARIAN, [PERMISSIONS.LIBRARY_MANAGE, PERMISSIONS.HOSTEL_MANAGE])).toBe(true);
    expect(canAny(ROLES.LIBRARIAN, [PERMISSIONS.HOSTEL_MANAGE, PERMISSIONS.ACCOUNTS_MANAGE])).toBe(false);
  });

  it("maps dashboard route prefixes to the permissions that guard them", () => {
    expect(getRequiredPermissionsForPath("/dashboard/students/123")).toEqual([PERMISSIONS.STUDENTS_VIEW]);
    expect(getRequiredPermissionsForPath("/dashboard/library")).toEqual([
      PERMISSIONS.LIBRARY_VIEW,
      PERMISSIONS.LIBRARY_MANAGE,
    ]);
  });

  it("returns null for routes with no RBAC mapping (e.g. the dashboard home)", () => {
    expect(getRequiredPermissionsForPath("/dashboard")).toBeNull();
  });

  // Guards the Phase 3 fix: broad *_VIEW holders (parents/students) must
  // never gate a staff-only roster endpoint. This test would fail loudly if
  // someone "simplified" a route back to the broad permission.
  it("HOSTEL_VIEW alone does not imply HOSTEL_MANAGE", () => {
    expect(can(ROLES.PARENT, PERMISSIONS.HOSTEL_VIEW)).toBe(true);
    expect(can(ROLES.PARENT, PERMISSIONS.HOSTEL_MANAGE)).toBe(false);
  });
});
