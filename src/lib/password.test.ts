import { describe, expect, it } from "vitest";
import { hashPassword, verifyPassword } from "./password";

describe("hashPassword / verifyPassword", () => {
  it("verifies a password against its own hash", async () => {
    const hash = await hashPassword("Sup3r$ecret!");
    await expect(verifyPassword("Sup3r$ecret!", hash)).resolves.toBe(true);
  });

  it("rejects a wrong password", async () => {
    const hash = await hashPassword("Sup3r$ecret!");
    await expect(verifyPassword("wrong-password", hash)).resolves.toBe(false);
  });

  it("produces a different hash each time (random salt)", async () => {
    const a = await hashPassword("same-password-A1!");
    const b = await hashPassword("same-password-A1!");
    expect(a).not.toBe(b);
    await expect(verifyPassword("same-password-A1!", a)).resolves.toBe(true);
    await expect(verifyPassword("same-password-A1!", b)).resolves.toBe(true);
  });

  it("stores the hash as salt:hex", async () => {
    const hash = await hashPassword("whatever-Password1!");
    const parts = hash.split(":");
    expect(parts).toHaveLength(2);
    expect(parts[0]).toMatch(/^[0-9a-f]{32}$/);
    expect(parts[1]).toMatch(/^[0-9a-f]{128}$/);
  });

  it("rejects a malformed stored value instead of throwing", async () => {
    await expect(verifyPassword("anything", "not-a-valid-hash")).resolves.toBe(false);
    await expect(verifyPassword("anything", "")).resolves.toBe(false);
  });

  it("supports unicode passwords", async () => {
    const hash = await hashPassword("mötdepassé🔒2026!");
    await expect(verifyPassword("mötdepassé🔒2026!", hash)).resolves.toBe(true);
  });
});
