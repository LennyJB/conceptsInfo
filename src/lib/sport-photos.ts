import fs from "node:fs";
import path from "node:path";
import type { Sport } from "@prisma/client";
import { SPORT_ICONS } from "@/lib/sports";

const CATEGORIES_DIR = path.join(process.cwd(), "public", "uploads", "categories");
const EXTENSIONS = ["jpg", "jpeg", "png", "webp"];

export function sportPhotoSlug(sport: Sport): string {
  const iconFilename = SPORT_ICONS[sport].split("/").pop() ?? "";
  return iconFilename.replace(/\.[^.]+$/, "");
}

/**
 * Looks for an admin-uploaded photo at public/uploads/categories/<slug>.<ext>.
 * Returns null if none exists yet, so callers can fall back to the icon tile.
 */
export function getSportPhotoUrl(sport: Sport): string | null {
  const slug = sportPhotoSlug(sport);
  for (const ext of EXTENSIONS) {
    if (fs.existsSync(path.join(CATEGORIES_DIR, `${slug}.${ext}`))) {
      return `/uploads/categories/${slug}.${ext}`;
    }
  }
  return null;
}
