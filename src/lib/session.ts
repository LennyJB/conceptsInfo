import crypto from "node:crypto";
import { cookies } from "next/headers";

function getAuthSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret) {
    throw new Error("AUTH_SECRET n'est pas configuré.");
  }
  return secret;
}

function sign(id: string): string {
  return crypto.createHmac("sha256", getAuthSecret()).update(id).digest("hex");
}

export async function createSignedSession(cookieName: string, id: string) {
  const cookieStore = await cookies();
  cookieStore.set(cookieName, `${id}.${sign(id)}`, {
    httpOnly: true,
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 30, // 30 jours
  });
}

export async function clearSignedSession(cookieName: string) {
  const cookieStore = await cookies();
  cookieStore.delete(cookieName);
}

export async function readSignedSessionId(cookieName: string): Promise<string | null> {
  const cookieStore = await cookies();
  const value = cookieStore.get(cookieName)?.value;
  if (!value) return null;

  const [id, signature] = value.split(".");
  if (!id || !signature) return null;

  const expected = sign(id);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !crypto.timingSafeEqual(a, b)) return null;

  return id;
}
