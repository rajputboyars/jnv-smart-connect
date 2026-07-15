/**
 * In-memory sliding-window rate limiter.
 *
 * Scoped to a single Node.js process, which matches how this app is meant to
 * be deployed initially (single Docker container / single Node server, see
 * docs/DEPLOYMENT.md). If the app is later horizontally scaled behind a load
 * balancer, replace the `buckets` Map with a shared store (Redis) behind the
 * same `checkRateLimit` signature — nothing outside this file needs to change.
 */

interface Bucket {
  count: number;
  resetAt: number;
}

const buckets = new Map<string, Bucket>();

// Periodically evict expired buckets so long-running processes don't leak
// memory from one-off IPs. `unref` lets the timer not keep the process alive
// in short-lived scripts/tests.
const CLEANUP_INTERVAL_MS = 5 * 60 * 1000;
let cleanupTimer: NodeJS.Timeout | null = null;

function ensureCleanupTimer() {
  if (cleanupTimer) return;
  cleanupTimer = setInterval(() => {
    const now = Date.now();
    for (const [key, bucket] of buckets) {
      if (bucket.resetAt <= now) buckets.delete(key);
    }
  }, CLEANUP_INTERVAL_MS);
  cleanupTimer.unref?.();
}

export interface RateLimitConfig {
  /** Window length in milliseconds. */
  windowMs: number;
  /** Max requests allowed per window. */
  max: number;
}

export interface RateLimitResult {
  allowed: boolean;
  limit: number;
  remaining: number;
  retryAfterSeconds: number;
}

export function checkRateLimit(key: string, config: RateLimitConfig): RateLimitResult {
  ensureCleanupTimer();

  const now = Date.now();
  const bucket = buckets.get(key);

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + config.windowMs });
    return {
      allowed: true,
      limit: config.max,
      remaining: config.max - 1,
      retryAfterSeconds: 0,
    };
  }

  if (bucket.count >= config.max) {
    return {
      allowed: false,
      limit: config.max,
      remaining: 0,
      retryAfterSeconds: Math.max(1, Math.ceil((bucket.resetAt - now) / 1000)),
    };
  }

  bucket.count += 1;
  return {
    allowed: true,
    limit: config.max,
    remaining: config.max - bucket.count,
    retryAfterSeconds: 0,
  };
}

/** Tiered rate-limit presets applied by path prefix, strictest first. */
export const RATE_LIMIT_TIERS: { prefix: string; config: RateLimitConfig }[] = [
  // Brute-force-sensitive auth endpoints.
  { prefix: "/api/auth/login", config: { windowMs: 15 * 60 * 1000, max: 10 } },
  { prefix: "/api/auth/register", config: { windowMs: 60 * 60 * 1000, max: 10 } },
  { prefix: "/api/auth/forgot-password", config: { windowMs: 15 * 60 * 1000, max: 5 } },
  { prefix: "/api/auth/reset-password", config: { windowMs: 15 * 60 * 1000, max: 10 } },
  { prefix: "/api/auth/refresh", config: { windowMs: 60 * 1000, max: 20 } },
  // AI endpoints call the paid Anthropic API — capped tighter than general
  // traffic so a runaway client can't run up a real-money bill.
  { prefix: "/api/ai", config: { windowMs: 10 * 60 * 1000, max: 20 } },
  // General API baseline — generous, just there to blunt scraping/abuse.
  { prefix: "/api", config: { windowMs: 60 * 1000, max: 300 } },
];

export function getRateLimitConfigForPath(pathname: string): RateLimitConfig | null {
  for (const tier of RATE_LIMIT_TIERS) {
    if (pathname === tier.prefix || pathname.startsWith(`${tier.prefix}/`)) {
      return tier.config;
    }
  }
  return null;
}

export function getClientIp(headers: Headers): string {
  const forwardedFor = headers.get("x-forwarded-for");
  if (forwardedFor) return forwardedFor.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
