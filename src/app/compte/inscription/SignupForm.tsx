"use client";

import { useActionState, useState } from "react";
import { createCoach, type CreateCoachState } from "@/lib/actions";
import { studentSignup, type StudentAuthState } from "@/lib/student-actions";
import { ALL_SPORTS, SPORT_LABELS } from "@/lib/sports";
import { MAX_VIDEO_SECONDS } from "@/lib/upload-limits";
import { PASSWORD_HINT } from "@/lib/password-policy";
import { SportIcon } from "@/components/SportIcon";
import { Button } from "@/components/ui/Button";
import { errorBoxClass, inputClass } from "@/lib/ui-styles";

type Role = "student" | "coach";

const initialStudentState: StudentAuthState = {};
const initialCoachState: CreateCoachState = {};

export function SignupForm({
  defaultRole,
  redirectTo,
}: {
  defaultRole: Role;
  redirectTo: string;
}) {
  const [role, setRole] = useState<Role>(defaultRole);
  const [videoError, setVideoError] = useState<string | null>(null);
  const [selectedSports, setSelectedSports] = useState<string[]>([]);

  const [studentState, studentFormAction, studentPending] = useActionState(
    studentSignup,
    initialStudentState
  );
  const [coachState, coachFormAction, coachPending] = useActionState(
    createCoach,
    initialCoachState
  );

  const isCoach = role === "coach";
  const error = isCoach ? coachState.error : studentState.error;
  const pending = isCoach ? coachPending : studentPending;

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
    <form
      action={isCoach ? coachFormAction : studentFormAction}
      className="mt-8 flex flex-col gap-5"
    >
      <input type="hidden" name="redirect" value={redirectTo} />

      <fieldset className="flex gap-2 rounded-full border border-black/[.08] p-1 dark:border-white/[.145]">
        <legend className="sr-only">Type de compte</legend>
        {(["student", "coach"] as const).map((r) => (
          <button
            key={r}
            type="button"
            onClick={() => setRole(r)}
            className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
              role === r
                ? "bg-brand text-brand-foreground"
                : "text-zinc-600 hover:bg-black/[.02] dark:text-zinc-400 dark:hover:bg-white/[.03]"
            }`}
          >
            {r === "student" ? "Je suis élève" : "Je suis coach"}
          </button>
        ))}
      </fieldset>

      {error && <p className={errorBoxClass}>{error}</p>}

      <Field label="Nom" name="name" placeholder="Ada Lovelace" required autoFocus />
      <Field
        label="Email"
        name="email"
        type="email"
        placeholder="ada@example.com"
        required
      />

      {isCoach && (
        <div>
          <Field
            label="Téléphone (optionnel)"
            name="phone"
            type="tel"
            placeholder="06 12 34 56 78"
          />
          <p className="mt-1.5 text-xs text-zinc-500">
            Ce numéro ne sera jamais public : il n&apos;est révélé qu&apos;aux
            élèves à qui vous aurez déjà répondu, dans leur conversation.
          </p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
        <Field label="Mot de passe" name="password" type="password" required />
        <Field
          label="Confirmer le mot de passe"
          name="confirmPassword"
          type="password"
          required
        />
      </div>
      <p className="-mt-3 text-xs text-zinc-500">
        {isCoach
          ? `Ce mot de passe vous permettra de vous connecter à votre espace coach pour lire et répondre aux messages des élèves. ${PASSWORD_HINT}`
          : PASSWORD_HINT}
      </p>

      {isCoach && (
        <>
          <fieldset className="flex flex-col gap-2">
            <legend className="text-sm font-medium">Sport(s) coaché(s)</legend>
            <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
              {ALL_SPORTS.map((sport) => {
                const checked = selectedSports.includes(sport);
                return (
                  <label
                    key={sport}
                    className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border px-3.5 py-3 text-xs font-medium transition-colors ${
                      checked
                        ? "border-transparent bg-brand text-brand-foreground"
                        : "border-black/[.08] text-zinc-600 hover:border-brand/40 hover:text-brand dark:border-white/[.145] dark:text-zinc-400"
                    }`}
                  >
                    <input
                      type="checkbox"
                      name="sports"
                      value={sport}
                      checked={checked}
                      onChange={(e) => {
                        setSelectedSports((prev) =>
                          e.target.checked
                            ? [...prev, sport]
                            : prev.filter((s) => s !== sport)
                        );
                      }}
                      className="sr-only"
                    />
                    <SportIcon sport={sport} size={28} />
                    {SPORT_LABELS[sport]}
                  </label>
                );
              })}
            </div>
            {selectedSports.includes("AUTRE") && (
              <div className="mt-2">
                <Field
                  label="Précisez le sport pour la catégorie “Autre”"
                  name="customSport"
                  placeholder="Escrime, Squash, Aviron..."
                  required
                />
                <p className="mt-1 text-xs text-zinc-500">
                  Ce nom sera vérifié par un administrateur avant publication.
                </p>
              </div>
            )}
          </fieldset>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">Bio</span>
            <textarea
              name="bio"
              required
              rows={5}
              placeholder="Présentez votre expérience et votre approche du coaching..."
              className={inputClass}
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Photo (jpg, png ou webp, 5 Mo max)
            </span>
            <input
              type="file"
              name="photo"
              accept="image/jpeg,image/png,image/webp"
              className="text-sm"
            />
          </label>

          <label className="flex flex-col gap-1.5">
            <span className="text-sm font-medium">
              Vidéo de présentation (mp4 ou webm, {MAX_VIDEO_SECONDS}s et 20 Mo
              max)
            </span>
            <input
              type="file"
              name="video"
              accept="video/mp4,video/webm"
              onChange={handleVideoChange}
              className="text-sm"
            />
            {videoError && (
              <span className="text-sm text-red-600">{videoError}</span>
            )}
          </label>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field
              label="Instagram (optionnel)"
              name="instagramUrl"
              placeholder="https://instagram.com/..."
            />
            <Field
              label="TikTok (optionnel)"
              name="tiktokUrl"
              placeholder="https://tiktok.com/@..."
            />
            <Field
              label="YouTube (optionnel)"
              name="youtubeUrl"
              placeholder="https://youtube.com/@..."
            />
            <Field
              label="Site web (optionnel)"
              name="websiteUrl"
              placeholder="https://..."
            />
          </div>
        </>
      )}

      <Button type="submit" disabled={pending || !!videoError} className="mt-2">
        {pending
          ? "Envoi en cours..."
          : isCoach
            ? "Publier mon profil"
            : "Créer mon compte"}
      </Button>
      {isCoach && (
        <p className="text-xs text-zinc-500">
          Votre profil sera visible dans l&apos;annuaire après validation.
        </p>
      )}
    </form>
  );
}

function Field({
  label,
  name,
  type = "text",
  placeholder,
  required,
  autoFocus,
}: {
  label: string;
  name: string;
  type?: string;
  placeholder?: string;
  required?: boolean;
  autoFocus?: boolean;
}) {
  return (
    <label className="flex flex-col gap-1.5">
      <span className="text-sm font-medium">{label}</span>
      <input
        name={name}
        type={type}
        placeholder={placeholder}
        required={required}
        autoFocus={autoFocus}
        className={inputClass}
      />
    </label>
  );
}
