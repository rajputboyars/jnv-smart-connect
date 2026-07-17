import type { NextRequest, NextResponse } from "next/server";
import { getAccessTokenPayload } from "@/lib/auth/session";
import type { AccessTokenPayload } from "@/lib/auth/jwt";
import { can, canAny, type Permission } from "@/lib/auth/rbac";
import { ApiError } from "@/lib/utils/api-error";

export type AuthedRouteHandler<Ctx = unknown> = (
  req: NextRequest,
  ctx: Ctx,
  session: AccessTokenPayload
) => Promise<NextResponse>;

/**
 * Wraps a Route Handler so it only runs for an authenticated request.
 * Throws ApiError(401) otherwise — caught by withErrorHandling.
 */
export function withAuth<Ctx = unknown>(handler: AuthedRouteHandler<Ctx>) {
  return async (req: NextRequest, ctx: Ctx) => {
    const session = await getAccessTokenPayload();

    if (!session) {
      throw ApiError.unauthorized("Please sign in to continue");
    }

    return handler(req, ctx, session);
  };
}

/**
 * Wraps a Route Handler so it only runs for an authenticated request whose
 * role holds the given permission.
 */
export function withPermission<Ctx = unknown>(
  permission: Permission,
  handler: AuthedRouteHandler<Ctx>
) {
  return withAuth<Ctx>(async (req, ctx, session) => {
    if (!can(session.role, permission)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }

    return handler(req, ctx, session);
  });
}

/**
 * Like withPermission, but passes as long as the caller holds ANY of the
 * given permissions — for endpoints shared by a broad self-service `_VIEW`
 * permission and a narrower staff `_MANAGE` one, where the controller/query
 * itself does the fine-grained scoping (e.g. a parent's own invoices vs. an
 * accountant's full list).
 */
export function withAnyPermission<Ctx = unknown>(
  permissions: Permission[],
  handler: AuthedRouteHandler<Ctx>
) {
  return withAuth<Ctx>(async (req, ctx, session) => {
    if (!canAny(session.role, permissions)) {
      throw ApiError.forbidden("You do not have permission to perform this action");
    }

    return handler(req, ctx, session);
  });
}
