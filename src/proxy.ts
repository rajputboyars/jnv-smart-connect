import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";
import { verifyAccessToken } from "@/lib/auth/jwt";
import { ACCESS_TOKEN_COOKIE } from "@/lib/auth/session";
import { getRequiredPermissionsForPath, can } from "@/lib/auth/rbac";
import { checkRateLimit, getRateLimitConfigForPath, getClientIp } from "@/lib/security/rate-limit";
import { isMutatingMethod, isTrustedOrigin } from "@/lib/security/csrf";

const PUBLIC_ROUTES = ["/login", "/forgot-password", "/reset-password"];

function isPublicRoute(pathname: string) {
  if (pathname === "/") return true;
  return PUBLIC_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

function withSecurityHeaders(response: NextResponse) {
  response.headers.set("X-Content-Type-Options", "nosniff");
  response.headers.set("X-Frame-Options", "DENY");
  response.headers.set("Referrer-Policy", "strict-origin-when-cross-origin");
  response.headers.set("Permissions-Policy", "camera=(), microphone=(), geolocation=()");
  return response;
}

function handleApiRequest(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const rateLimitConfig = getRateLimitConfigForPath(pathname);
  if (rateLimitConfig) {
    const ip = getClientIp(request.headers);
    const result = checkRateLimit(`${ip}:${pathname}`, rateLimitConfig);
    if (!result.allowed) {
      return withSecurityHeaders(
        NextResponse.json(
          { success: false, message: "Too many requests, please try again later" },
          {
            status: 429,
            headers: {
              "Retry-After": String(result.retryAfterSeconds),
              "X-RateLimit-Limit": String(result.limit),
              "X-RateLimit-Remaining": "0",
            },
          }
        )
      );
    }
  }

  if (isMutatingMethod(request.method) && !isTrustedOrigin(request.headers, request.url)) {
    return withSecurityHeaders(
      NextResponse.json({ success: false, message: "Cross-origin request blocked" }, { status: 403 })
    );
  }

  return withSecurityHeaders(NextResponse.next());
}

function handlePageRequest(request: NextRequest): NextResponse {
  const { pathname } = request.nextUrl;

  const token = request.cookies.get(ACCESS_TOKEN_COOKIE)?.value;
  const session = token ? verifyAccessToken(token) : null;

  // Authenticated users shouldn't see the auth pages again.
  if (session && isPublicRoute(pathname) && pathname !== "/") {
    return withSecurityHeaders(NextResponse.redirect(new URL("/dashboard", request.url)));
  }

  if (isPublicRoute(pathname)) {
    return withSecurityHeaders(NextResponse.next());
  }

  // Everything else under the app requires a session.
  if (!session) {
    const loginUrl = new URL("/login", request.url);
    loginUrl.searchParams.set("next", pathname);
    return withSecurityHeaders(NextResponse.redirect(loginUrl));
  }

  // Optimistic RBAC check for module routes (defense in depth happens again
  // server-side in the page/API layer against the database).
  const requiredPermissions = getRequiredPermissionsForPath(pathname);
  if (requiredPermissions && !requiredPermissions.some((p) => can(session.role, p))) {
    return withSecurityHeaders(NextResponse.redirect(new URL("/unauthorized", request.url)));
  }

  return withSecurityHeaders(NextResponse.next());
}

export function proxy(request: NextRequest) {
  if (request.nextUrl.pathname.startsWith("/api")) {
    return handleApiRequest(request);
  }
  return handlePageRequest(request);
}

export const config = {
  matcher: ["/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)"],
};
