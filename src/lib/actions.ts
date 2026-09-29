"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { findOrCreateCategoryByLabel } from "@/lib/categories";
import { UploadValidationError, savePhoto, saveVideo } from "@/lib/uploads";
import { hashPassword } from "@/lib/password";
import { validatePassword } from "@/lib/password-policy";
import { createCoachSession, requireCoach } from "@/lib/coach-auth";

export type CreateCoachState = { error?: string };

function optionalUrl(formData: FormData, field: string): string | undefined {
  const value = String(formData.get(field) ?? "").trim();
  return value || undefined;
}

function uniqueNames(values: string[]): string[] {
  const seen = new Set<string>();
  const result: string[] = [];
  for (const value of values) {
    const key = value.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    result.push(value);
  }
  return result;
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
  const categoryIds = formData.getAll("categoryIds").map(String);
  const newCategoryNames = uniqueNames(
    formData.getAll("newCategories").map((v) => String(v).trim()).filter(Boolean)
  );

  if (!name || !email || !bio || (categoryIds.length === 0 && newCategoryNames.length === 0)) {
    return { error: "Merci de remplir tous les champs et de choisir au moins une catégorie." };
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

  const validExisting = await prisma.category.findMany({
    where: { id: { in: categoryIds }, status: "APPROVED" },
    select: { id: true },
  });
  const newCategories = await Promise.all(
    newCategoryNames.map((label) => findOrCreateCategoryByLabel(label))
  );
  const allCategoryIds = [
    ...validExisting.map((c) => c.id),
    ...newCategories.filter((c): c is NonNullable<typeof c> => Boolean(c)).map((c) => c.id),
  ];

  if (allCategoryIds.length === 0) {
    return { error: "Merci de choisir au moins une catégorie." };
  }

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
        categories: { connect: allCategoryIds.map((id) => ({ id })) },
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

export type UpdateCoachProfileState = { error?: string; success?: boolean };

export async function updateCoachProfile(
  _prevState: UpdateCoachProfileState,
  formData: FormData
): Promise<UpdateCoachProfileState> {
  const coach = await requireCoach();

  const name = String(formData.get("name") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim();
  const categoryIds = formData.getAll("categoryIds").map(String);
  const newCategoryNames = uniqueNames(
    formData.getAll("newCategories").map((v) => String(v).trim()).filter(Boolean)
  );

  if (!name || !bio || (categoryIds.length === 0 && newCategoryNames.length === 0)) {
    return { error: "Merci de remplir tous les champs et de choisir au moins une catégorie." };
  }

  const validExisting = await prisma.category.findMany({
    where: { id: { in: categoryIds }, status: "APPROVED" },
    select: { id: true },
  });
  const newCategories = await Promise.all(
    newCategoryNames.map((label) => findOrCreateCategoryByLabel(label))
  );
  const allCategoryIds = [
    ...validExisting.map((c) => c.id),
    ...newCategories.filter((c): c is NonNullable<typeof c> => Boolean(c)).map((c) => c.id),
  ];

  if (allCategoryIds.length === 0) {
    return { error: "Merci de choisir au moins une catégorie." };
  }

  const photo = formData.get("photo");
  const video = formData.get("video");
  const mediaUpdate: { photoUrl?: string; videoUrl?: string } = {};

  try {
    if (photo instanceof File && photo.size > 0) {
      mediaUpdate.photoUrl = await savePhoto(coach.id, photo);
    }
    if (video instanceof File && video.size > 0) {
      mediaUpdate.videoUrl = await saveVideo(coach.id, video);
    }
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return { error: err.message };
    }
    throw err;
  }

  await prisma.coach.update({
    where: { id: coach.id },
    data: {
      name,
      phone,
      bio,
      categories: { set: allCategoryIds.map((id) => ({ id })) },
      instagramUrl: optionalUrl(formData, "instagramUrl") ?? null,
      tiktokUrl: optionalUrl(formData, "tiktokUrl") ?? null,
      youtubeUrl: optionalUrl(formData, "youtubeUrl") ?? null,
      websiteUrl: optionalUrl(formData, "websiteUrl") ?? null,
      ...mediaUpdate,
    },
  });

  revalidatePath("/compte");
  revalidatePath(`/coachs/${coach.id}`);
  return { success: true };
}
