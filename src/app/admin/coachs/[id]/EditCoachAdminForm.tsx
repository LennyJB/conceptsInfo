"use client";

import { useActionState } from "react";
import type { Category, Coach } from "@prisma/client";
import { updateCoachAdmin, type UpdateCoachAdminState } from "@/lib/admin-actions";
import { CategoryPicker } from "@/components/CategoryPicker";
import { Field } from "@/components/ui/Field";
import { Button } from "@/components/ui/Button";
import { errorBoxClass, inputClass } from "@/lib/ui-styles";

const initialState: UpdateCoachAdminState = {};

export function EditCoachAdminForm({
  coach,
  allCategories,
}: {
  coach: Coach & { categories: Category[] };
  allCategories: Category[];
}) {
  const [state, formAction, pending] = useActionState(
    updateCoachAdmin.bind(null, coach.id),
    initialState
  );

  return (
    <form action={formAction} className="mt-6 flex flex-col gap-4">
      {state.error && <p className={errorBoxClass}>{state.error}</p>}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Field label="Nom" name="name" defaultValue={coach.name} required />
        <Field label="Email" name="email" type="email" defaultValue={coach.email} required />
      </div>
      <Field label="Téléphone" name="phone" type="tel" defaultValue={coach.phone ?? ""} />

      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Bio</span>
        <textarea name="bio" required rows={4} defaultValue={coach.bio} className={inputClass} />
      </label>

      <fieldset className="flex flex-col gap-2">
        <legend className="text-sm font-medium">Catégories</legend>
        <CategoryPicker
          categories={allCategories}
          initialSelectedIds={coach.categories.map((c) => c.id)}
        />
      </fieldset>

      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Enregistrement..." : "Enregistrer"}
      </Button>
    </form>
  );
}
