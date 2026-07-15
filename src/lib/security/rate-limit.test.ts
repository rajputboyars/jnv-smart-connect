import { describe, expect, it } from "vitest";
import { checkRateLimit, getClientIp, getRateLimitConfigForPath } from "./rate-limit";

describe("checkRateLimit", () => {
  it("allows requests up to the max, then blocks", () => {
    const key = `test:${Math.random()}`;
    const config = { windowMs: 60_000, max: 3 };

    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);
    expect(checkRateLimit(key, config).allowed).toBe(true);

    const blocked = checkRateLimit(key, config);
    expect(blocked.allowed).toBe(false);
    expect(blocked.remaining).toBe(0);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
  });

  it("tracks separate buckets per key", () => {
    const config = { windowMs: 60_000, max: 1 };
    const keyA = `a:${Math.random()}`;
    const keyB = `b:${Math.random()}`;

    expect(checkRateLimit(keyA, config).allowed).toBe(true);
    expect(checkRateLimit(keyA, config).allowed).toBe(false);
    expect(checkRateLimit(keyB, config).allowed).toBe(true);
  });
});

describe("getRateLimitConfigForPath", () => {
  it("matches the strictest tier for auth endpoints", () => {
    expect(getRateLimitConfigForPath("/api/auth/login")).toEqual({ windowMs: 15 * 60 * 1000, max: 10 });
  });

  it("falls back to the general /api baseline for other routes", () => {
    expect(getRateLimitConfigForPath("/api/students")).toEqual({ windowMs: 60 * 1000, max: 300 });
  });

  it("applies a tighter budget-conscious tier to the paid AI endpoints", () => {
    expect(getRateLimitConfigForPath("/api/ai/chat")).toEqual({ windowMs: 10 * 60 * 1000, max: 20 });
  });

  it("returns null for non-api routes", () => {
    expect(getRateLimitConfigForPath("/dashboard/students")).toBeNull();
  });
});

describe("getClientIp", () => {
  it("takes the first IP from x-forwarded-for", () => {
    const headers = new Headers({ "x-forwarded-for": "203.0.113.5, 10.0.0.1" });
    expect(getClientIp(headers)).toBe("203.0.113.5");
  });

  it("falls back to x-real-ip, then unknown", () => {
    expect(getClientIp(new Headers({ "x-real-ip": "203.0.113.9" }))).toBe("203.0.113.9");
    expect(getClientIp(new Headers())).toBe("unknown");
  });
});
