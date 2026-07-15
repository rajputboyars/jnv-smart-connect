import { describe, expect, it } from "vitest";
import { loginSchema, registerSchema, resetPasswordSchema } from "./auth.validator";

describe("loginSchema", () => {
  it("accepts a valid email/password", () => {
    expect(loginSchema.safeParse({ email: "a@example.com", password: "anything" }).success).toBe(true);
  });

  it("rejects an invalid email", () => {
    const result = loginSchema.safeParse({ email: "not-an-email", password: "anything" });
    expect(result.success).toBe(false);
  });

  it("rejects an empty password", () => {
    const result = loginSchema.safeParse({ email: "a@example.com", password: "" });
    expect(result.success).toBe(false);
  });
});

describe("registerSchema", () => {
  it("enforces the password complexity policy", () => {
    const base = { name: "Jane Doe", email: "jane@example.com", role: "teacher" as const };
    expect(registerSchema.safeParse({ ...base, password: "alllowercase1" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "NoDigitsHere" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "short1A" }).success).toBe(false);
    expect(registerSchema.safeParse({ ...base, password: "ValidPass1" }).success).toBe(true);
  });

  it("rejects an unknown role", () => {
    const result = registerSchema.safeParse({
      name: "Jane Doe",
      email: "jane@example.com",
      password: "ValidPass1",
      role: "super_hacker",
    });
    expect(result.success).toBe(false);
  });
});

describe("resetPasswordSchema", () => {
  it("requires password and confirmPassword to match", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "ValidPass1",
      confirmPassword: "Mismatch1",
    });
    expect(result.success).toBe(false);
  });

  it("passes when they match", () => {
    const result = resetPasswordSchema.safeParse({
      token: "abc123",
      password: "ValidPass1",
      confirmPassword: "ValidPass1",
    });
    expect(result.success).toBe(true);
  });
});
