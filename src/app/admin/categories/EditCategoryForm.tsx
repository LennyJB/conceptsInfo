"use client";

import { useActionState, useState } from "react";
import type { Category } from "@prisma/client";
import { updateCategory, type CategoryFormState } from "@/lib/admin-actions";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/lib/ui-styles";

export const COLOR_OPTIONS = [
  "bg-orange-500",
  "bg-emerald-500",
  "bg-violet-500",
  "bg-lime-600",
  "bg-sky-500",
  "bg-amber-500",
  "bg-cyan-500",
  "bg-rose-500",
  "bg-red-600",
  "bg-teal-500",
  "bg-pink-400",
  "bg-zinc-700",
  "bg-fuchsia-500",
  "bg-stone-500",
  "bg-gray-400",
  "bg-indigo-500",
  "bg-blue-500",
  "bg-purple-500",
  "bg-yellow-500",
  "bg-green-600",
  "bg-slate-500",
];

function colorLabel(className: string) {
  return className.replace("bg-", "").replace(/-\d+$/, "");
}

const initialState: CategoryFormState = {};

export function EditCategoryForm({ category }: { category: Category }) {
  const [state, formAction, pending] = useActionState(
    updateCategory.bind(null, category.id),
    initialState
  );
  const [color, setColor] = useState(category.color);

  return (
    <form action={formAction} className="flex flex-wrap items-center gap-2">
      <input
        name="label"
        defaultValue={category.label}
        required
        className={`w-40 ${inputClass}`}
      />
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
      <Button type="submit" variant="secondary" size="sm" disabled={pending}>
        {pending ? "..." : "Enregistrer"}
      </Button>
      {state.error && <span className="text-xs text-red-600">{state.error}</span>}
    </form>
  );
}
