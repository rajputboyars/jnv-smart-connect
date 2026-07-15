import { describe, expect, it } from "vitest";
import { isMutatingMethod, isTrustedOrigin } from "./csrf";

describe("isMutatingMethod", () => {
  it("flags POST/PUT/PATCH/DELETE as mutating", () => {
    expect(isMutatingMethod("POST")).toBe(true);
    expect(isMutatingMethod("put")).toBe(true);
    expect(isMutatingMethod("PATCH")).toBe(true);
    expect(isMutatingMethod("delete")).toBe(true);
  });

  it("does not flag GET/HEAD/OPTIONS", () => {
    expect(isMutatingMethod("GET")).toBe(false);
    expect(isMutatingMethod("HEAD")).toBe(false);
    expect(isMutatingMethod("OPTIONS")).toBe(false);
  });
});

describe("isTrustedOrigin", () => {
  const requestUrl = "https://jnvsmartconnect.example/api/students";

  it("trusts a matching Origin header", () => {
    const headers = new Headers({ origin: "https://jnvsmartconnect.example" });
    expect(isTrustedOrigin(headers, requestUrl)).toBe(true);
  });

  it("rejects a cross-origin Origin header", () => {
    const headers = new Headers({ origin: "https://evil.example" });
    expect(isTrustedOrigin(headers, requestUrl)).toBe(false);
  });

  it("falls back to Referer when Origin is absent", () => {
    const headers = new Headers({ referer: "https://jnvsmartconnect.example/dashboard" });
    expect(isTrustedOrigin(headers, requestUrl)).toBe(true);
  });

  it("allows requests with neither header (non-browser clients)", () => {
    expect(isTrustedOrigin(new Headers(), requestUrl)).toBe(true);
  });
});
