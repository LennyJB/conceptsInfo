import crypto from "node:crypto";
import { cookies } from "next/headers";

const COOKIE_NAME = "admin_session";

function getAdminPassword(): string {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) {
    throw new Error("ADMIN_PASSWORD n'est pas configuré.");
  }
  return password;
}

function getExpectedToken(): string {
  return crypto
    .createHmac("sha256", getAdminPassword())
    .update("admin_session")
    .digest("hex");
}

export function checkAdminPassword(password: string): boolean {
  const expected = Buffer.from(getAdminPassword());
  const provided = Buffer.from(password);
  if (expected.length !== provided.length) return false;
  return crypto.timingSafeEqual(expected, provided);
}

export async function createAdminSession() {
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, getExpectedToken(), {
    httpOnly: true,
    // Opt-in: activez COOKIE_SECURE=true une fois un reverse proxy HTTPS en
    // place devant l'app. En laissant "secure" à false par défaut, le login
    // admin fonctionne aussi en HTTP simple (ex: accès direct via docker-compose).
    secure: process.env.COOKIE_SECURE === "true",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24 * 7, // 7 jours
  });
}

export async function clearAdminSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export async function isAdminAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return false;

  const expected = getExpectedToken();
  const a = Buffer.from(token);
  const b = Buffer.from(expected);
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

export async function requireAdmin() {
  if (!(await isAdminAuthenticated())) {
    throw new Error("Non autorisé.");
  }
}
