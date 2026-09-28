"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import { getCurrentCoach, requireCoach } from "@/lib/coach-auth";
import { getCurrentStudent, requireStudent } from "@/lib/student-auth";
import { sendMail } from "@/lib/mailer";

export async function toggleCoachEmailNotifications() {
  const coach = await requireCoach();
  await prisma.coach.update({
    where: { id: coach.id },
    data: { emailNotifications: !coach.emailNotifications },
  });
  revalidatePath("/compte");
}

export type StartConversationState = { error?: string };

export async function startConversation(
  coachId: string,
  _prevState: StartConversationState,
  formData: FormData
): Promise<StartConversationState> {
  const student = await getCurrentStudent();
  if (!student) {
    return { error: "Connectez-vous pour envoyer un message." };
  }

  const body = String(formData.get("body") ?? "").trim();
  if (!body) {
    return { error: "Le message ne peut pas être vide." };
  }

  const coach = await prisma.coach.findUnique({ where: { id: coachId } });
  if (!coach || coach.status !== "APPROVED") {
    return { error: "Ce coach n'est pas disponible." };
  }

  const conversation = await prisma.conversation.upsert({
    where: { coachId_studentId: { coachId, studentId: student.id } },
    create: { coachId, studentId: student.id },
    update: {},
  });

  await prisma.message.create({
    data: { conversationId: conversation.id, sender: "STUDENT", body },
  });

  if (conversation.notifyByEmail && coach.emailNotifications) {
    await sendMail({
      to: coach.email,
      subject: `Nouveau message de ${student.name}`,
      text: `${student.name} vous a envoyé un message :\n\n${body}\n\nRépondez depuis votre espace coach.`,
    });
  }

  revalidatePath("/compte");
  redirect(`/compte/conversations/${conversation.id}`);
}

export type ReplyState = { error?: string };

export async function sendStudentReply(
  conversationId: string,
  _prevState: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  const student = await requireStudent();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Le message ne peut pas être vide." };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { coach: true },
  });
  if (!conversation || conversation.studentId !== student.id) {
    return { error: "Conversation introuvable." };
  }

  await prisma.message.create({
    data: { conversationId, sender: "STUDENT", body },
  });

  if (conversation.notifyByEmail && conversation.coach.emailNotifications) {
    await sendMail({
      to: conversation.coach.email,
      subject: `Nouveau message de ${student.name}`,
      text: `${student.name} vous a envoyé un message :\n\n${body}\n\nRépondez depuis votre espace coach.`,
    });
  }

  revalidatePath(`/compte/conversations/${conversationId}`);
  return {};
}

export async function sendCoachReply(
  conversationId: string,
  _prevState: ReplyState,
  formData: FormData
): Promise<ReplyState> {
  const coach = await requireCoach();
  const body = String(formData.get("body") ?? "").trim();
  if (!body) return { error: "Le message ne peut pas être vide." };

  const conversation = await prisma.conversation.findUnique({
    where: { id: conversationId },
    include: { student: true },
  });
  if (!conversation || conversation.coachId !== coach.id) {
    return { error: "Conversation introuvable." };
  }

  await prisma.message.create({
    data: { conversationId, sender: "COACH", body },
  });

  if (conversation.notifyByEmail && conversation.student.emailNotifications) {
    await sendMail({
      to: conversation.student.email,
      subject: `Nouvelle réponse de ${coach.name}`,
      text: `${coach.name} vous a répondu :\n\n${body}\n\nConsultez la conversation dans votre espace élève.`,
    });
  }

  revalidatePath(`/compte/conversations/${conversationId}`);
  return {};
}

export async function toggleConversationNotifications(conversationId: string) {
  const [coach, student] = await Promise.all([getCurrentCoach(), getCurrentStudent()]);
  const conversation = await prisma.conversation.findUnique({ where: { id: conversationId } });
  if (!conversation) throw new Error("Conversation introuvable.");

  const isParticipant =
    (coach && conversation.coachId === coach.id) ||
    (student && conversation.studentId === student.id);
  if (!isParticipant) throw new Error("Non autorisé.");

  await prisma.conversation.update({
    where: { id: conversationId },
    data: { notifyByEmail: !conversation.notifyByEmail },
  });

  revalidatePath(`/compte/conversations/${conversationId}`);
}
