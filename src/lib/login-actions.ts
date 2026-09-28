"use server";

import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { verifyPassword } from "@/lib/password";
import { createCoachSession, clearCoachSession } from "@/lib/coach-auth";
import { createStudentSession, clearStudentSession } from "@/lib/student-auth";

export type LoginState = { error?: string };

function safeRedirectTarget(value: FormDataEntryValue | null): string {
  const target = String(value ?? "");
  return target.startsWith("/") ? target : "/compte";
}

export async function login(
  _prevState: LoginState,
  formData: FormData
): Promise<LoginState> {
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const redirectTo = safeRedirectTarget(formData.get("redirect"));

  const coach = await prisma.coach.findUnique({ where: { email } });
  if (coach?.passwordHash && (await verifyPassword(password, coach.passwordHash))) {
    await createCoachSession(coach.id);
    redirect(redirectTo);
  }

  const student = await prisma.student.findUnique({ where: { email } });
  if (student && (await verifyPassword(password, student.passwordHash))) {
    await createStudentSession(student.id);
    redirect(redirectTo);
  }

  return { error: "Email ou mot de passe incorrect." };
}

export async function logout() {
  await Promise.all([clearCoachSession(), clearStudentSession()]);
  redirect("/compte/login");
}
