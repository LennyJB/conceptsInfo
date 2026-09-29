"use client";

import { useActionState, useState } from "react";
import type { Category, Coach } from "@prisma/client";
import { updateCoachProfile, type UpdateCoachProfileState } from "@/lib/actions";
import { MAX_VIDEO_SECONDS } from "@/lib/upload-limits";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { errorBoxClass, inputClass } from "@/lib/ui-styles";

const initialState: UpdateCoachProfileState = {};

export function EditProfileForm({
  coach,
  categories,
}: {
  coach: Coach & { categories: Category[] };
  categories: Category[];
}) {
  const [state, formAction, pending] = useActionState(updateCoachProfile, initialState);
  const [videoError, setVideoError] = useState<string | null>(null);

  function handleVideoChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    setVideoError(null);
    if (!file) return;

    const url = URL.createObjectURL(file);
    const videoEl = document.createElement("video");
    videoEl.preload = "metadata";
    videoEl.onloadedmetadata = () => {
      URL.revokeObjectURL(url);
      if (videoEl.duration > MAX_VIDEO_SECONDS) {
        setVideoError(
          `Cette vidéo dure ${Math.round(videoEl.duration)}s, le maximum est ${MAX_VIDEO_SECONDS}s.`
        );
        e.target.value = "";
      }
    };
    videoEl.src = url;
  }

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-5">
      {state.error && <p className={errorBoxClass}>{state.error}</p>}
      {state.success && (
        <p className="rounded-lg bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:bg-emerald-950 dark:text-emerald-300">
          Profil mis à jour.
        </p>
      )}

      <Field label="Nom" name="name" defaultValue={coach.name} required autoFocus />

      <div>
        <Field
          label="Téléphone (optionnel)"
          name="phone"
          type="tel"
          defaultValue={coach.phone ?? ""}
          placeholder="06 12 34 56 78"
        />
        <p className="mt-1.5 text-xs text-zinc-500">
          Ce numéro ne sera jamais public : il n&apos;est révélé qu&apos;aux élèves à qui vous
          aurez déjà répondu, dans leur conversation.
        </p>
      </div>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Catégorie(s) coachée(s)</legend>
        <CategoryPicker
          categories={categories}
          initialSelectedIds={coach.categories.map((c) => c.id)}
        />
      </fieldset>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Bio</span>
        <textarea
          name="bio"
          required
          rows={5}
          defaultValue={coach.bio}
          className={inputClass}
        />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Nouvelle photo (jpg, png ou webp, 5 Mo max) — laissez vide pour garder l&apos;actuelle
        </span>
        <input type="file" name="photo" accept="image/jpeg,image/png,image/webp" className="text-sm" />
      </label>

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">
          Nouvelle vidéo (mp4 ou webm, {MAX_VIDEO_SECONDS}s et 20 Mo max) — laissez vide pour
          garder l&apos;actuelle
        </span>
        <input
          type="file"
          name="video"
          accept="video/mp4,video/webm"
          onChange={handleVideoChange}
          className="text-sm"
        />
        {videoError && <span className="text-sm text-red-600">{videoError}</span>}
      </label>

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field
          label="Instagram (optionnel)"
          name="instagramUrl"
          defaultValue={coach.instagramUrl ?? ""}
          placeholder="https://instagram.com/..."
        />
        <Field
          label="TikTok (optionnel)"
          name="tiktokUrl"
          defaultValue={coach.tiktokUrl ?? ""}
          placeholder="https://tiktok.com/@..."
        />
        <Field
          label="YouTube (optionnel)"
          name="youtubeUrl"
          defaultValue={coach.youtubeUrl ?? ""}
          placeholder="https://youtube.com/@..."
        />
        <Field
          label="Site web (optionnel)"
          name="websiteUrl"
          defaultValue={coach.websiteUrl ?? ""}
          placeholder="https://..."
        />
      </div>

      <Button type="submit" disabled={pending || !!videoError} className="mt-2">
        {pending ? "Enregistrement..." : "Enregistrer les modifications"}
      </Button>
    </form>
  );
}
