"use client";

import { useActionState } from "react";
import { startConversation, type StartConversationState } from "@/lib/coach-actions";
import { Button } from "@/components/ui/Button";
import { errorBoxClass, inputClass } from "@/lib/ui-styles";

const initialState: StartConversationState = {};

export function ContactForm({ coachId }: { coachId: string }) {
  const [state, formAction, pending] = useActionState(
    startConversation.bind(null, coachId),
    initialState
  );

  return (
    <form action={formAction} className="mt-3 flex flex-col gap-3">
      {state.error && <p className={errorBoxClass}>{state.error}</p>}
      <textarea
        name="body"
        rows={4}
        required
        placeholder="Votre message..."
        className={inputClass}
      />
      <Button type="submit" disabled={pending} className="self-start">
        {pending ? "Envoi..." : "Envoyer le message"}
      </Button>
    </form>
  );
}
