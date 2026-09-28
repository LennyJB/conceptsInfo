import { prisma } from "@/lib/prisma";
import { createSignedSession, clearSignedSession, readSignedSessionId } from "@/lib/session";

export { hashPassword, verifyPassword } from "@/lib/password";

const COOKIE_NAME = "coach_session";

export async function createCoachSession(coachId: string) {
  await createSignedSession(COOKIE_NAME, coachId);
}

export async function clearCoachSession() {
  await clearSignedSession(COOKIE_NAME);
}

export async function getCurrentCoach() {
  const coachId = await readSignedSessionId(COOKIE_NAME);
  if (!coachId) return null;
  return prisma.coach.findUnique({ where: { id: coachId } });
}

export async function requireCoach() {
  const coach = await getCurrentCoach();
  if (!coach) {
    throw new Error("Non autorisé.");
  }
  return coach;
}
