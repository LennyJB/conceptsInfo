import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = vi.hoisted(() => new Map<string, { value: string }>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieJar.get(name),
    set: (name: string, value: string) => cookieJar.set(name, { value }),
    delete: (name: string) => cookieJar.delete(name),
  }),
}));

const { checkAdminPassword, createAdminSession, clearAdminSession, isAdminAuthenticated } =
  await import("./admin-auth");

beforeEach(() => {
  cookieJar.clear();
  process.env.ADMIN_PASSWORD = "the-admin-password";
});

describe("checkAdminPassword", () => {
  it("accepts the correct password", () => {
    expect(checkAdminPassword("the-admin-password")).toBe(true);
  });

  it("rejects a wrong password", () => {
    expect(checkAdminPassword("nope")).toBe(false);
  });

  it("rejects a password of a different length without throwing", () => {
    expect(checkAdminPassword("the-admin-password-but-longer")).toBe(false);
  });
});

describe("admin session", () => {
  it("is not authenticated with no session cookie", async () => {
    await expect(isAdminAuthenticated()).resolves.toBe(false);
  });

  it("becomes authenticated after createAdminSession", async () => {
    await createAdminSession();
    await expect(isAdminAuthenticated()).resolves.toBe(true);
  });

  it("is no longer authenticated after clearAdminSession", async () => {
    await createAdminSession();
    await clearAdminSession();
    await expect(isAdminAuthenticated()).resolves.toBe(false);
  });

  it("rejects a session token signed under a different admin password", async () => {
    await createAdminSession();
    process.env.ADMIN_PASSWORD = "a-different-password";
    await expect(isAdminAuthenticated()).resolves.toBe(false);
  });
});
