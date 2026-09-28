"use client";

import { useActionState } from "react";
import { adminLogin } from "@/lib/admin-actions";
import { Button } from "@/components/ui/Button";
import { errorBoxClass, inputClass } from "@/lib/ui-styles";

export function AdminLoginForm() {
  const [state, formAction, pending] = useActionState(adminLogin, {});

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      {state.error && <p className={errorBoxClass}>{state.error}</p>}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Mot de passe admin</span>
        <input
          type="password"
          name="password"
          required
          autoFocus
          className={inputClass}
        />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
