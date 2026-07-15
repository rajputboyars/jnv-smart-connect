import { describe, expect, it } from "vitest";
import { signAccessToken, signRefreshToken, verifyAccessToken, verifyRefreshToken } from "./jwt";

describe("access tokens", () => {
  it("round-trips a signed payload", () => {
    const token = signAccessToken({
      sub: "user-1",
      role: "teacher",
      school: "school-1",
      name: "Test Teacher",
      email: "teacher@example.com",
    });

    const payload = verifyAccessToken(token);
    expect(payload).toMatchObject({ sub: "user-1", role: "teacher", email: "teacher@example.com" });
  });

  it("rejects a tampered token", () => {
    const token = signAccessToken({
      sub: "user-1",
      role: "teacher",
      school: "school-1",
      name: "Test Teacher",
      email: "teacher@example.com",
    });
    const tampered = token.slice(0, -2) + (token.at(-2) === "a" ? "b" : "a") + token.at(-1);
    expect(verifyAccessToken(tampered)).toBeNull();
  });

  it("rejects garbage input instead of throwing", () => {
    expect(verifyAccessToken("not-a-jwt")).toBeNull();
  });
});

describe("refresh tokens", () => {
  it("round-trips and is rejected by the access-token verifier (different secret)", () => {
    const refreshToken = signRefreshToken({ sub: "user-1" });
    expect(verifyRefreshToken(refreshToken)).toMatchObject({ sub: "user-1" });
    expect(verifyAccessToken(refreshToken)).toBeNull();
  });
});
