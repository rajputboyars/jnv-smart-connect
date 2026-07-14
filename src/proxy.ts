import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getRequiredPermissionForPath, can } from "@/lib/auth/rbac";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

function isPublicRoute(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const session = token ? verifyAccessToken(token) : null;

  // Authenticated users shouldn't see the auth pages again.
  if (session && isPublicRoute(pathname) && pathname !== "/") {
    return NextResponse.redirect(new URL("/dashboard", request.url));
  }

  if (isPublicRoute(pathname)) {
    return NextResponse.next();
  }

  // Everything else under the app requires a session.
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return NextResponse.redirect(loginUrl);
  }

  // Optimistic RBAC check for module routes (defense in depth happens again
  // server-side in the page/API layer against the database).
  const requiredPermission = getRequiredPermissionForPath(pathname);
  if (requiredPermission && !can(session.role, requiredPermission)) {
    return NextResponse.redirect(new URL("/unauthorized", request.url));
  }

  return NextResponse.next();
}

export const config = {
  matcher: ["/((?!api|_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
