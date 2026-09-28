"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { hashPassword } from "@/lib/password";
import { validatePassword } from "@/lib/password-policy";
import { createStudentSession, requireStudent } from "@/lib/student-auth";

function safeRedirectTarget(value: FormDataEntryValue | null): string {
  const target = String(value ?? "");
  return target.startsWith("/") ? target : "/compte";
}

export type StudentAuthState = { error?: string };

export async function studentSignup(
  _prevState: StudentAuthState,
  formData: FormData
): Promise<StudentAuthState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const redirectTo = safeRedirectTarget(formData.get("redirect"));

  if (!name || !email) {
    return { error: "Merci de remplir tous les champs." };
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const passwordHash = await hashPassword(password);

  let student;
  try {
    student = await prisma.student.create({ data: { name, email, passwordHash } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Un compte existe déjà avec cet email." };
    }
    throw err;
  }

  await createStudentSession(student.id);
  redirect(redirectTo);
}

export async function toggleStudentEmailNotifications() {
  const student = await requireStudent();
  await prisma.student.update({
    where: { id: student.id },
    data: { emailNotifications: !student.emailNotifications },
  });
  revalidatePath("/compte");
}
