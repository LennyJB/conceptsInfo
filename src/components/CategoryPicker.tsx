"use client";

import { useState } from "react";
import type { Category } from "@prisma/client";
import { CategoryIcon } from "@/components/CategoryIcon";
import { Button } from "@/components/ui/Button";
import { inputClass } from "@/lib/ui-styles";

export function CategoryPicker({
  categories,
  initialSelectedIds = [],
}: {
  categories: Category[];
  initialSelectedIds?: string[];
}) {
  const [selectedIds, setSelectedIds] = useState<string[]>(initialSelectedIds);
  const [newNames, setNewNames] = useState<string[]>([]);
  const [input, setInput] = useState("");

  function toggle(id: string) {
    setSelectedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  }

  function addNewCategory() {
    const trimmed = input.trim();
    if (!trimmed) return;

    const matching = categories.find((c) => c.label.toLowerCase() === trimmed.toLowerCase());
    if (matching) {
      setSelectedIds((prev) => (prev.includes(matching.id) ? prev : [...prev, matching.id]));
      setInput("");
      return;
    }

    setNewNames((prev) => {
      if (prev.some((n) => n.toLowerCase() === trimmed.toLowerCase())) return prev;
      return [...prev, trimmed];
    });
    setInput("");
  }

  function removeNewCategory(name: string) {
    setNewNames((prev) => prev.filter((n) => n !== name));
  }

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:grid-cols-4">
        {categories.map((category) => {
          const checked = selectedIds.includes(category.id);
          return (
            <label
              key={category.id}
              className={`flex cursor-pointer flex-col items-center gap-2 rounded-2xl border px-3.5 py-3 text-xs font-medium transition-colors ${
                checked
                  ? "border-transparent bg-brand text-brand-foreground"
                  : "border-black/[.08] text-zinc-600 hover:border-brand/40 hover:text-brand dark:border-white/[.145] dark:text-zinc-400"
              }`}
            >
              <input
                type="checkbox"
                name="categoryIds"
                value={category.id}
                checked={checked}
                onChange={() => toggle(category.id)}
                className="sr-only"
              />
              <CategoryIcon category={category} size={28} />
              {category.label}
            </label>
          );
        })}
      </div>

      <div>
        <span className="text-sm font-medium">Proposer une nouvelle catégorie</span>
        <div className="mt-1.5 flex gap-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                addNewCategory();
              }
            }}
            placeholder="Escrime, Squash, Aviron..."
            className={`flex-1 ${inputClass}`}
          />
          <Button type="button" variant="secondary" size="sm" onClick={addNewCategory}>
            Ajouter
          </Button>
        </div>
        <p className="mt-1.5 text-xs text-zinc-500">
          Chaque nouvelle catégorie est vérifiée par un administrateur avant d&apos;apparaître
          dans l&apos;annuaire. Vous pouvez en proposer autant que vous voulez.
        </p>
        {newNames.length > 0 && (
          <ul className="mt-2 flex flex-wrap gap-2">
            {newNames.map((name) => (
              <li key={name}>
                <input type="hidden" name="newCategories" value={name} />
                <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 py-1 pr-1.5 pl-3 text-xs font-medium text-amber-800 dark:bg-amber-950 dark:text-amber-300">
                  {name}
                  <button
                    type="button"
                    onClick={() => removeNewCategory(name)}
                    aria-label={`Retirer ${name}`}
                    className="rounded-full p-0.5 hover:bg-amber-200 dark:hover:bg-amber-900"
                  >
                    ×
                  </button>
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}
