"use server";

import { rm } from "node:fs/promises";
import path from "node:path";
import type { Sport } from "@prisma/client";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { prisma } from "@/lib/prisma";
import {
  checkAdminPassword,
  clearAdminSession,
  createAdminSession,
  requireAdmin,
} from "@/lib/admin-auth";
import { BROWSABLE_SPORTS } from "@/lib/sports";
import { sportPhotoSlug } from "@/lib/sport-photos";
import { saveCategoryPhoto, UploadValidationError } from "@/lib/uploads";
import { sendMail } from "@/lib/mailer";

export async function adminLogin(
  _prevState: { error?: string },
  formData: FormData
): Promise<{ error?: string }> {
  const password = String(formData.get("password") ?? "");

  if (!checkAdminPassword(password)) {
    return { error: "Mot de passe incorrect." };
  }

  await createAdminSession();
  redirect("/admin");
}

export async function adminLogout() {
  await clearAdminSession();
  redirect("/admin");
}

export async function approveCoach(coachId: string, formData: FormData) {
  await requireAdmin();
  const customSport = String(formData.get("customSport") ?? "").trim();

  const coach = await prisma.coach.update({
    where: { id: coachId },
    data: {
      status: "APPROVED",
      ...(customSport ? { customSport } : {}),
    },
  });

  if (coach.emailNotifications) {
    await sendMail({
      to: coach.email,
      subject: "Votre profil a été approuvé",
      text: `Bonjour ${coach.name},\n\nVotre profil coach est maintenant visible dans l'annuaire. Connectez-vous à votre espace coach pour le consulter.\n\nÀ bientôt !`,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/");
}

export async function rejectCoach(coachId: string) {
  await requireAdmin();
  await prisma.coach.delete({ where: { id: coachId } });
  await rm(path.join(process.cwd(), "public", "uploads", "coaches", coachId), {
    recursive: true,
    force: true,
  });
  revalidatePath("/admin");
}

export type UploadCategoryPhotoState = { error?: string };

export async function uploadCategoryPhoto(
  sport: Sport,
  _prevState: UploadCategoryPhotoState,
  formData: FormData
): Promise<UploadCategoryPhotoState> {
  await requireAdmin();

  if (!BROWSABLE_SPORTS.includes(sport)) {
    return { error: "Catégorie invalide." };
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "Merci de choisir une image." };
  }

  const slug = sportPhotoSlug(sport);
  const categoriesDir = path.join(process.cwd(), "public", "uploads", "categories");
  // Supprime les anciennes variantes (autre extension) pour éviter les doublons.
  for (const ext of ["jpg", "jpeg", "png", "webp"]) {
    await rm(path.join(categoriesDir, `${slug}.${ext}`), { force: true });
  }

  try {
    await saveCategoryPhoto(slug, photo);
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return { error: err.message };
    }
    throw err;
  }

  revalidatePath("/admin");
  revalidatePath("/");
  revalidatePath(`/sports/${sport}`);
  return {};
}
