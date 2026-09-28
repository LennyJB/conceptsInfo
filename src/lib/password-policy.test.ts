import { describe, expect, it } from "vitest";
import { PASSWORD_MIN_LENGTH, validatePassword } from "./password-policy";

describe("validatePassword", () => {
  it("accepts a password meeting every requirement", () => {
    expect(validatePassword("Coachs2026!Sport")).toBeNull();
  });

  it("accepts a password exactly at the minimum length", () => {
    const exact = "Aa1!".padEnd(PASSWORD_MIN_LENGTH, "x");
    expect(exact).toHaveLength(PASSWORD_MIN_LENGTH);
    expect(validatePassword(exact)).toBeNull();
  });

  it("rejects a password below the minimum length", () => {
    expect(validatePassword("Aa1!x")).not.toBeNull();
  });

  it("rejects a password missing an uppercase letter", () => {
    expect(validatePassword("coachs2026!sport")).not.toBeNull();
  });

  it("rejects a password missing a lowercase letter", () => {
    expect(validatePassword("COACHS2026!SPORT")).not.toBeNull();
  });

  it("rejects a password missing a digit", () => {
    expect(validatePassword("Coachs!Sport!!")).not.toBeNull();
  });

  it("rejects a password missing a special character", () => {
    expect(validatePassword("Coachs2026Sport")).not.toBeNull();
  });

  it("rejects an empty password", () => {
    expect(validatePassword("")).not.toBeNull();
  });
});
