import { prisma } from "@/lib/prisma";
import { createSignedSession, clearSignedSession, readSignedSessionId } from "@/lib/session";

const COOKIE_NAME = "student_session";

export async function createStudentSession(studentId: string) {
  await createSignedSession(COOKIE_NAME, studentId);
}

export async function clearStudentSession() {
  await clearSignedSession(COOKIE_NAME);
}

export async function getCurrentStudent() {
  const studentId = await readSignedSessionId(COOKIE_NAME);
  if (!studentId) return null;
  return prisma.student.findUnique({ where: { id: studentId } });
}

export async function requireStudent() {
  const student = await getCurrentStudent();
  if (!student) {
    throw new Error("Non autorisé.");
  }
  return student;
}
