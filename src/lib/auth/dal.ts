import "server-only";
import { cache } from "react";
import { redirect } from "next/navigation";
import { getAccessTokenPayload } from "./session";
import { can, type Permission } from "./rbac";
import type { AccessTokenPayload } from "./jwt";
import type { Role } from "@/types/roles";

/**
 * Memoized per-request session read. Optimistic only (reads the signed
 * cookie) — do not use this alone to gate sensitive data fetches; combine
 * with a DB-backed check (e.g. re-fetching the User document) where needed.
 */
export const getSession = cache(async (): Promise<AccessTokenPayload | null> => {
  return getAccessTokenPayload();
});

export async function requireSession(allowedRoles?: Role[]): Promise<AccessTokenPayload> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (allowedRoles && allowedRoles.length > 0 && !allowedRoles.includes(session.role)) {
    redirect("/unauthorized");
  }

  return session;
}

/** Same as requireSession, but gates on an RBAC permission instead of an explicit role list. */
export async function requirePermission(permission: Permission): Promise<AccessTokenPayload> {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  if (!can(session.role, permission)) {
    redirect("/unauthorized");
  }

  return session;
}
