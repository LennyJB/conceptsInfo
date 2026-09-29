"use client";

import { useActionState, useState } from "react";
import { createCategory, type CategoryFormState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/lib/ui-styles";
import { COLOR_OPTIONS } from "./EditCategoryForm";

function colorLabel(className: string) {
  return className.replace("bg-", "").replace(/-\d+$/, "");
}

const initialState: CategoryFormState = {};

export function CreateCategoryForm() {
  const [state, formAction, pending] = useActionState(createCategory, initialState);
  const [color, setColor] = useState(COLOR_OPTIONS[0]);

  return (
    <form action={formAction} className="flex flex-wrap items-end gap-2">
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-500">Nom</span>
        <input name="label" required placeholder="Escrime" className={`w-44 ${inputClass}`} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-xs font-medium text-zinc-500">Couleur</span>
        <div className="flex items-center gap-2">
          <span className={`h-7 w-7 shrink-0 rounded-full ${color}`} aria-hidden />
          <select
            name="color"
            value={color}
            onChange={(e) => setColor(e.target.value)}
            className={`w-32 ${inputClass}`}
          >
            {COLOR_OPTIONS.map((c) => (
              <option key={c} value={c}>
                {colorLabel(c)}
              </option>
            ))}
          </select>
        </div>
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Création..." : "Créer la catégorie"}
      </Button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
