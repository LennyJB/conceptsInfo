"use client";

import { useActionState } from "react";
import { login, type LoginState } from "@/lib/login-actions";
import { Button } from "@/components/ui/Button";
import { errorBoxClass, inputClass } from "@/lib/ui-styles";

const initialState: LoginState = {};

export function LoginForm({ redirectTo }: { redirectTo: string }) {
  const [state, formAction, pending] = useActionState(login, initialState);

  return (
    <form action={formAction} className="mt-8 flex flex-col gap-4">
      <input type="hidden" name="redirect" value={redirectTo} />
      {state.error && <p className={errorBoxClass}>{state.error}</p>}
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Email</span>
        <input type="email" name="email" required autoFocus className={inputClass} />
      </label>
      <label className="flex flex-col gap-1.5">
        <span className="text-sm font-medium">Mot de passe</span>
        <input type="password" name="password" required className={inputClass} />
      </label>
      <Button type="submit" disabled={pending}>
        {pending ? "Connexion..." : "Se connecter"}
      </Button>
    </form>
  );
}
