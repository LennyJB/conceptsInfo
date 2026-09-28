import { mkdir, writeFile } from "node:fs/promises";
import path from "node:path";
import { MAX_PHOTO_BYTES, MAX_VIDEO_BYTES } from "@/lib/upload-limits";

const UPLOADS_ROOT = path.join(process.cwd(), "public", "uploads");
const COACHES_ROOT = path.join(UPLOADS_ROOT, "coaches");
const CATEGORIES_ROOT = path.join(UPLOADS_ROOT, "categories");

const IMAGE_TYPES: Record<string, string> = {
  "image/jpeg": "jpg",
  "image/png": "png",
  "image/webp": "webp",
};

const VIDEO_TYPES: Record<string, string> = {
  "video/mp4": "mp4",
  "video/webm": "webm",
};

export class UploadValidationError extends Error {}

async function writeValidatedFile(
  dir: string,
  filenameBase: string,
  file: File,
  allowedTypes: Record<string, string>,
  maxBytes: number,
  invalidTypeMessage: string,
  tooLargeMessage: (maxMb: number) => string
): Promise<string> {
  const extension = allowedTypes[file.type];
  if (!extension) {
    throw new UploadValidationError(invalidTypeMessage);
  }
  if (file.size > maxBytes) {
    throw new UploadValidationError(tooLargeMessage(maxBytes / 1024 / 1024));
  }

  await mkdir(dir, { recursive: true });
  const filename = `${filenameBase}.${extension}`;
  const buffer = Buffer.from(await file.arrayBuffer());
  await writeFile(path.join(dir, filename), buffer);

  return filename;
}

export async function savePhoto(coachId: string, file: File) {
  const filename = await writeValidatedFile(
    path.join(COACHES_ROOT, coachId),
    "photo",
    file,
    IMAGE_TYPES,
    MAX_PHOTO_BYTES,
    "Format de photo non supporté (jpg, png ou webp uniquement).",
    (maxMb) => `La photo dépasse la taille maximale de ${maxMb} Mo.`
  );
  return `/uploads/coaches/${coachId}/${filename}`;
}

export async function saveVideo(coachId: string, file: File) {
  const filename = await writeValidatedFile(
    path.join(COACHES_ROOT, coachId),
    "video",
    file,
    VIDEO_TYPES,
    MAX_VIDEO_BYTES,
    "Format de vidéo non supporté (mp4 ou webm uniquement).",
    (maxMb) => `La vidéo dépasse la taille maximale de ${maxMb} Mo.`
  );
  return `/uploads/coaches/${coachId}/${filename}`;
}

export async function saveCategoryPhoto(sportSlug: string, file: File) {
  const filename = await writeValidatedFile(
    CATEGORIES_ROOT,
    sportSlug,
    file,
    IMAGE_TYPES,
    MAX_PHOTO_BYTES,
    "Format de photo non supporté (jpg, png ou webp uniquement).",
    (maxMb) => `La photo dépasse la taille maximale de ${maxMb} Mo.`
  );
  return `/uploads/categories/${filename}`;
}
