"use server";

import { rm } from "node:fs/promises";
import path from "node:path";
import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import {
  checkAdminPassword,
  clearAdminSession,
  createAdminSession,
  requireAdmin,
} from "@/lib/admin-auth";
import { findOrCreateCategoryByLabel, slugify } from "@/lib/categories";
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

export async function approveCoach(coachId: string) {
  await requireAdmin();

  const coach = await prisma.coach.update({
    where: { id: coachId },
    data: { status: "APPROVED" },
  });

  if (coach.emailNotifications) {
    await sendMail({
      to: coach.email,
      subject: "Votre profil a été approuvé",
      text: `Bonjour ${coach.name},\n\nVotre profil coach est maintenant visible dans l'annuaire. Connectez-vous à votre espace coach pour le consulter.\n\nÀ bientôt !`,
    });
  }

  revalidatePath("/admin");
  revalidatePath("/admin/users");
  revalidatePath("/");
}

export async function deleteCoach(coachId: string) {
  await requireAdmin();
  await prisma.coach.delete({ where: { id: coachId } });
  await rm(path.join(process.cwd(), "public", "uploads", "coaches", coachId), {
    recursive: true,
    force: true,
  });
  revalidatePath("/admin");
  revalidatePath("/admin/users");
}

export type UpdateCoachAdminState = { error?: string };

export async function updateCoachAdmin(
  coachId: string,
  _prevState: UpdateCoachAdminState,
  formData: FormData
): Promise<UpdateCoachAdminState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();
  const phone = String(formData.get("phone") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim();
  const categoryIds = formData.getAll("categoryIds").map(String);
  const newCategoryNames = formData
    .getAll("newCategories")
    .map((v) => String(v).trim())
    .filter(Boolean);

  if (!name || !email || !bio || (categoryIds.length === 0 && newCategoryNames.length === 0)) {
    return { error: "Merci de remplir tous les champs et de choisir au moins une catégorie." };
  }

  const validExisting = await prisma.category.findMany({
    where: { id: { in: categoryIds } },
    select: { id: true },
  });
  const newCategories = await Promise.all(
    newCategoryNames.map((label) => findOrCreateCategoryByLabel(label))
  );
  const allCategoryIds = [
    ...validExisting.map((c) => c.id),
    ...newCategories.filter((c): c is NonNullable<typeof c> => Boolean(c)).map((c) => c.id),
  ];

  try {
    await prisma.coach.update({
      where: { id: coachId },
      data: { name, email, phone, bio, categories: { set: allCategoryIds.map((id) => ({ id })) } },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Un profil existe déjà avec cet email." };
    }
    throw err;
  }

  revalidatePath(`/admin/coachs/${coachId}`);
  revalidatePath("/admin/users");
  revalidatePath("/");
  return {};
}

export type UpdateStudentAdminState = { error?: string };

export async function updateStudentAdmin(
  studentId: string,
  _prevState: UpdateStudentAdminState,
  formData: FormData
): Promise<UpdateStudentAdminState> {
  await requireAdmin();

  const name = String(formData.get("name") ?? "").trim();
  const email = String(formData.get("email") ?? "").trim();

  if (!name || !email) {
    return { error: "Merci de remplir tous les champs." };
  }

  try {
    await prisma.student.update({ where: { id: studentId }, data: { name, email } });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Un compte existe déjà avec cet email." };
    }
    throw err;
  }

  revalidatePath("/admin/users");
  return {};
}

export async function deleteStudent(studentId: string) {
  await requireAdmin();
  await prisma.student.delete({ where: { id: studentId } });
  revalidatePath("/admin/users");
}

// ---- Categories ----

export type CategoryFormState = { error?: string };

export async function createCategory(
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const label = String(formData.get("label") ?? "").trim();
  const color = String(formData.get("color") ?? "bg-gray-400");
  const slug = slugify(label);

  if (!label || !slug) {
    return { error: "Merci de donner un nom à la catégorie." };
  }

  try {
    await prisma.category.create({
      data: { label, slug, color, status: "APPROVED" },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      return { error: "Une catégorie avec ce nom existe déjà." };
    }
    throw err;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}

export async function updateCategory(
  categoryId: string,
  _prevState: CategoryFormState,
  formData: FormData
): Promise<CategoryFormState> {
  await requireAdmin();

  const label = String(formData.get("label") ?? "").trim();
  const color = String(formData.get("color") ?? "bg-gray-400");

  if (!label) {
    return { error: "Le nom ne peut pas être vide." };
  }

  await prisma.category.update({
    where: { id: categoryId },
    data: { label, color },
  });

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}

export async function approveCategory(categoryId: string) {
  await requireAdmin();
  await prisma.category.update({ where: { id: categoryId }, data: { status: "APPROVED" } });
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export async function deleteCategory(categoryId: string) {
  await requireAdmin();
  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  await prisma.category.delete({ where: { id: categoryId } });
  if (category?.photoUrl) {
    await rm(path.join(process.cwd(), "public", category.photoUrl), { force: true });
  }
  revalidatePath("/admin/categories");
  revalidatePath("/");
}

export type UploadCategoryPhotoState = { error?: string };

export async function uploadCategoryPhoto(
  categoryId: string,
  _prevState: UploadCategoryPhotoState,
  formData: FormData
): Promise<UploadCategoryPhotoState> {
  await requireAdmin();

  const category = await prisma.category.findUnique({ where: { id: categoryId } });
  if (!category) {
    return { error: "Catégorie introuvable." };
  }

  const photo = formData.get("photo");
  if (!(photo instanceof File) || photo.size === 0) {
    return { error: "Merci de choisir une image." };
  }

  try {
    const photoUrl = await saveCategoryPhoto(category.slug, photo);
    await prisma.category.update({ where: { id: categoryId }, data: { photoUrl } });
  } catch (err) {
    if (err instanceof UploadValidationError) {
      return { error: err.message };
    }
    throw err;
  }

  revalidatePath("/admin/categories");
  revalidatePath("/");
  return {};
}
