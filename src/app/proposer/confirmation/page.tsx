import { ButtonLink } from "@/components/ui/Button";

export default function ConfirmationPage() {
  return (
    <main className="mx-auto max-w-xl px-6 py-16 text-center">
      <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-emerald-100 text-2xl dark:bg-emerald-900/40">
        ✓
      </div>
      <h1 className="mt-6 text-3xl font-semibold tracking-tight">
        Profil envoyé !
      </h1>
      <p className="mt-4 text-zinc-600 dark:text-zinc-400">
        Merci, votre profil est en attente de validation par un administrateur.
        Il apparaîtra dans l&apos;annuaire dès qu&apos;il sera approuvé. Vous
        êtes déjà connecté : rendez-vous dans votre espace pour suivre vos
        messages.
      </p>
      <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
        <ButtonLink href="/compte">Accéder à mon compte</ButtonLink>
        <ButtonLink href="/" variant="secondary">
          Retour à l&apos;annuaire
        </ButtonLink>
      </div>
    </main>
  );
}
