"use client";

import { useActionState } from "react";
import { Button } from "@/components/ui/Button";
import { errorBoxClass, inputClass } from "@/lib/ui-styles";

type ThreadMessage = {
  id: string;
  sender: "STUDENT" | "COACH";
  body: string;
  createdAt: Date;
};

type ReplyState = { error?: string };

export function MessageThread({
  messages,
  viewerRole,
  replyAction,
}: {
  messages: ThreadMessage[];
  viewerRole: "STUDENT" | "COACH";
  replyAction: (prevState: ReplyState, formData: FormData) => Promise<ReplyState>;
}) {
  const [state, formAction, pending] = useActionState(replyAction, {});

  return (
    <div className="flex flex-col gap-4">
      <ul className="flex flex-col gap-3">
        {messages.map((message) => {
          const mine = message.sender === viewerRole;
          return (
            <li key={message.id} className={`flex ${mine ? "justify-end" : "justify-start"}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-4 py-2.5 text-sm ${
                  mine
                    ? "bg-brand text-brand-foreground"
                    : "bg-black/[.06] dark:bg-white/[.08]"
                }`}
              >
                <p className="whitespace-pre-line">{message.body}</p>
                <p
                  className={`mt-1 text-[11px] ${
                    mine ? "text-brand-foreground/70" : "text-zinc-500"
                  }`}
                >
                  {message.createdAt.toLocaleString("fr-FR", {
                    dateStyle: "short",
                    timeStyle: "short",
                  })}
                </p>
              </div>
            </li>
          );
        })}
      </ul>

      <form action={formAction} className="flex flex-col gap-2">
        {state.error && <p className={errorBoxClass}>{state.error}</p>}
        <textarea
          name="body"
          required
          rows={3}
          placeholder="Écrivez votre message..."
          className={inputClass}
        />
        <Button type="submit" disabled={pending} className="self-end">
          {pending ? "Envoi..." : "Envoyer"}
        </Button>
      </form>
    </div>
  );
}
