"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma, Sport } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ALL_SPORTS } from "@/lib/sports";
import { UploadValidationError, savePhoto, saveVideo } from "@/lib/uploads";
import { hashPassword } from "@/lib/password";
import { validatePassword } from "@/lib/password-policy";
import { createCoachSession } from "@/lib/coach-auth";

export type CreateCoachState = { error?: string };

function optionalUrl(formData: FormData, field: string): string | undefined {
  const value = String(formData.get(field) ?? "").trim();
  return value || undefined;
}

export async function createCoach(
  _prevState: CreateCoachState,
  formData: FormData
): Promise<CreateCoachState> {
  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || undefined;
  const bio = String(formData.get("bio") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const confirmPassword = String(formData.get("confirmPassword") ?? "");
  const sports = formData
    .getAll("sports")
    .map(String)
    .filter((value): value is Sport => ALL_SPORTS.includes(value as Sport));
  const customSport = String(formData.get("customSport") ?? "").trim() || undefined;

  if (!name || !email || !bio || sports.length === 0) {
    return { error: "Merci de remplir tous les champs et de choisir au moins un sport." };
  }
  if (sports.includes("AUTRE") && !customSport) {
    return { error: "Merci de préciser le nom du sport pour la catégorie \"Autre\"." };
  }
  const passwordError = validatePassword(password);
  if (passwordError) {
    return { error: passwordError };
  }
  if (password !== confirmPassword) {
    return { error: "Les mots de passe ne correspondent pas." };
  }

  const photo = formData.get("photo");
  const video = formData.get("video");

  const passwordHash = await hashPassword(password);

  let coach;
  try {
    coach = await prisma.coach.create({
      data: {
        name,
        email,
        phone,
        passwordHash,
        bio,
        sports,
        customSport,
        instagramUrl: optionalUrl(formData, "instagramUrl"),
        tiktokUrl: optionalUrl(formData, "tiktokUrl"),
        youtubeUrl: optionalUrl(formData, "youtubeUrl"),
        websiteUrl: optionalUrl(formData, "websiteUrl"),
      },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Un profil existe déjà avec cet email." };
    }
    throw err;
  }

  try {
    const mediaUpdate: { photoUrl?: string; videoUrl?: string } = {};

    if (photo instanceof File && photo.size > 0) {
      mediaUpdate.photoUrl = await savePhoto(coach.id, photo);
    }
    if (video instanceof File && video.size > 0) {
      mediaUpdate.videoUrl = await saveVideo(coach.id, video);
    }

    if (Object.keys(mediaUpdate).length > 0) {
      await prisma.coach.update({ where: { id: coach.id }, data: mediaUpdate });
    }
  } catch (err) {
    // Le profil est créé mais les fichiers sont invalides : on annule tout.
    await prisma.coach.delete({ where: { id: coach.id } });
    if (err instanceof UploadValidationError) {
      return { error: err.message };
    }
    throw err;
  }

  await createCoachSession(coach.id);
  revalidatePath("/");
  redirect("/proposer/confirmation");
}
