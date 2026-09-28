import { beforeEach, describe, expect, it, vi } from "vitest";

const cookieJar = vi.hoisted(() => new Map<string, { value: string }>());

vi.mock("next/headers", () => ({
  cookies: async () => ({
    get: (name: string) => cookieJar.get(name),
    set: (name: string, value: string) => cookieJar.set(name, { value }),
    delete: (name: string) => cookieJar.delete(name),
  }),
}));

const { createSignedSession, clearSignedSession, readSignedSessionId } = await import(
  "./session"
);

const COOKIE = "coach_session";

beforeEach(() => {
  cookieJar.clear();
  process.env.AUTH_SECRET = "test-secret";
});

describe("signed session cookies", () => {
  it("round-trips: create then read returns the same id", async () => {
    await createSignedSession(COOKIE, "coach-123");
    await expect(readSignedSessionId(COOKIE)).resolves.toBe("coach-123");
  });

  it("returns null when no cookie is set", async () => {
    await expect(readSignedSessionId(COOKIE)).resolves.toBeNull();
  });

  it("returns null for a cookie with no signature", async () => {
    cookieJar.set(COOKIE, { value: "coach-123" });
    await expect(readSignedSessionId(COOKIE)).resolves.toBeNull();
  });

  it("rejects a tampered id (signature no longer matches)", async () => {
    await createSignedSession(COOKIE, "coach-123");
    const stored = cookieJar.get(COOKIE)!.value;
    const [, signature] = stored.split(".");
    cookieJar.set(COOKIE, { value: `someone-elses-id.${signature}` });
    await expect(readSignedSessionId(COOKIE)).resolves.toBeNull();
  });

  it("rejects a cookie signed with a different secret", async () => {
    await createSignedSession(COOKIE, "coach-123");
    process.env.AUTH_SECRET = "a-different-secret";
    await expect(readSignedSessionId(COOKIE)).resolves.toBeNull();
  });

  it("clearSignedSession removes the cookie", async () => {
    await createSignedSession(COOKIE, "coach-123");
    await clearSignedSession(COOKIE);
    await expect(readSignedSessionId(COOKIE)).resolves.toBeNull();
  });

  it("keeps separate cookie names independent", async () => {
    await createSignedSession("coach_session", "coach-1");
    await createSignedSession("student_session", "student-1");
    await expect(readSignedSessionId("coach_session")).resolves.toBe("coach-1");
    await expect(readSignedSessionId("student_session")).resolves.toBe("student-1");
  });
});
