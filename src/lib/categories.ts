import { Prisma } from "@prisma/client";
import { prisma } from "@/lib/prisma";

// Auto-assigned to a category a coach proposes at signup, since there is no
// icon to pick from for a brand new category. Deliberately excludes the
// colors already used by the 14 curated categories seeded in the migration.
const NEW_CATEGORY_COLOR_PALETTE = [
  "bg-indigo-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-green-600",
  "bg-slate-500",
];

export function slugify(label: string): string {
  return label
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-+|-+$)/g, "");
}

function pickColorFor(seed: string): string {
  let hash = 0;
  for (const char of seed) hash = (hash * 31 + char.charCodeAt(0)) >>> 0;
  return NEW_CATEGORY_COLOR_PALETTE[hash % NEW_CATEGORY_COLOR_PALETTE.length];
}

export function getBrowsableCategories() {
  return prisma.category.findMany({
    where: { status: "APPROVED" },
    orderBy: { label: "asc" },
  });
}

export function getCategoryBySlug(slug: string) {
  return prisma.category.findUnique({ where: { slug } });
}

/**
 * Finds an existing category by name (case/accent-insensitive via the slug),
 * or creates a new PENDING one for admin review. Used when a coach proposes
 * a category that doesn't exist yet in the picker.
 */
export async function findOrCreateCategoryByLabel(rawLabel: string) {
  const label = rawLabel.trim();
  const slug = slugify(label);
  if (!label || !slug) return null;

  const existing = await prisma.category.findUnique({ where: { slug } });
  if (existing) return existing;

  try {
    return await prisma.category.create({
      data: { slug, label, color: pickColorFor(slug), status: "PENDING" },
    });
  } catch (err) {
    if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002") {
      // Another request created it in the meantime.
      return prisma.category.findUnique({ where: { slug } });
    }
    throw err;
  }
}
