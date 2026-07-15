/**
 * Origin/Referer verification for state-changing requests.
 *
 * The app authenticates with httpOnly cookies (SameSite=Lax), which already
 * blocks cross-site form-style POSTs in modern browsers. This check is
 * defense-in-depth against SameSite gaps (older browsers, subdomain
 * same-site quirks) by rejecting any mutating request whose Origin/Referer
 * doesn't match the app's own origin.
 */

const MUTATING_METHODS = new Set(["POST", "PUT", "PATCH", "DELETE"]);

export function isMutatingMethod(method: string): boolean {
  return MUTATING_METHODS.has(method.toUpperCase());
}

function extractOrigin(url: string): string | null {
  try {
    return new URL(url).origin;
  } catch {
    return null;
  }
}

export function isTrustedOrigin(headers: Headers, requestUrl: string): boolean {
  const origin = headers.get("origin") ?? extractOrigin(headers.get("referer") ?? "");
  if (!origin) {
    // No Origin/Referer at all — typical of same-origin server-to-server or
    // non-browser API clients (curl, mobile). We can't verify those, but we
    // also can't tell them apart from a stripped-header attack, so we allow
    // it only because the httpOnly cookie is still required to authenticate.
    return true;
  }

  const selfOrigin = extractOrigin(requestUrl);
  const configuredOrigin = process.env.APP_URL ? extractOrigin(process.env.APP_URL) : null;

  return origin === selfOrigin || (configuredOrigin !== null && origin === configuredOrigin);
}
