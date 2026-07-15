import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("password hashing", () => {
  it("hashes are not the plaintext and verify correctly", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(hash).not.toBe("Sup3rSecret!");
    expect(await verifyPassword("Sup3rSecret!", hash)).toBe(true);
  });

  it("rejects the wrong password", async () => {
    const hash = await hashPassword("Sup3rSecret!");
    expect(await verifyPassword("wrong-password", hash)).toBe(false);
  });

  it("produces a different hash each time (random salt)", async () => {
    const [a, b] = await Promise.all([hashPassword("same-input"), hashPassword("same-input")]);
    expect(a).not.toBe(b);
  });
});
