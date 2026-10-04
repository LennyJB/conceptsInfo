import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCurrentStudent } from "@/lib/student-auth";
import { CategoryTag } from "@/components/CategoryTag";
import { ButtonLink } from "@/components/ui/Button";
import { cardClass, textLinkClass } from "@/lib/ui-styles";
import { ContactForm } from "./ContactForm";

export const dynamic = "force-dynamic";

export default async function CoachPage(props: PageProps<"/coachs/[id]">) {
  const { id } = await props.params;
  const [coach, student] = await Promise.all([
    prisma.coach.findUnique({ where: { id }, include: { categories: true } }),
    getCurrentStudent(),
  ]);

  if (!coach) {
    notFound();
  }

  const socialLinks = [
    { label: "Instagram", href: coach.instagramUrl },
    { label: "TikTok", href: coach.tiktokUrl },
    { label: "YouTube", href: coach.youtubeUrl },
    { label: "Site web", href: coach.websiteUrl },
  ].filter((link): link is { label: string; href: string } => Boolean(link.href));

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className={textLinkClass}>
        ← Retour
      </Link>

      <div className="mt-6 flex items-center gap-5">
        {coach.photoUrl ? (
          <Image
            src={coach.photoUrl}
            alt={coach.name}
            width={96}
            height={96}
            className="h-24 w-24 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-24 w-24 shrink-0 items-center justify-center rounded-full bg-brand/10 text-2xl font-medium text-brand dark:bg-brand/20">
            {coach.name.charAt(0).toUpperCase()}
          </div>
        )}
        <h1 className="text-3xl font-semibold tracking-tight">
          {coach.name}
        </h1>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {coach.categories.map((category) => (
          <CategoryTag key={category.id} category={category} />
        ))}
      </div>

      <p className="mt-6 whitespace-pre-line text-zinc-700 dark:text-zinc-300">
        {coach.bio}
      </p>

      {coach.videoUrl && (
        <video
          src={coach.videoUrl}
          controls
          className="mt-6 w-full rounded-xl bg-black"
        />
      )}

      {socialLinks.length > 0 && (
        <div className="mt-6 flex flex-wrap gap-3">
          {socialLinks.map((link) => (
            <a
              key={link.label}
              href={link.href}
              target="_blank"
              rel="noopener noreferrer"
              className="rounded-full border border-black/[.08] px-3.5 py-1.5 text-sm transition-colors hover:border-brand/40 hover:text-brand dark:border-white/[.145] dark:hover:border-brand/40"
            >
              {link.label}
            </a>
          ))}
        </div>
      )}

      <div className={`mt-8 p-5 ${cardClass}`}>
        <h2 className="text-lg font-medium">
          Contacter {coach.name}
        </h2>
        <p className="mt-1 text-sm text-zinc-500">
          Les coordonnées du coach ne sont pas publiques : le contact passe par la messagerie.
        </p>
        {student ? (
          <ContactForm coachId={coach.id} />
        ) : (
          <div className="mt-3 rounded-lg bg-black/[.03] p-4 text-sm dark:bg-white/[.05]">
            <p className="text-zinc-600 dark:text-zinc-400">
              Connectez-vous ou créez un compte pour envoyer un message à{" "}
              {coach.name}.
            </p>
            <div className="mt-3 flex gap-3">
              <ButtonLink
                href={`/compte/login?redirect=/coachs/${coach.id}`}
                size="sm"
              >
                Se connecter
              </ButtonLink>
              <ButtonLink
                href={`/compte/inscription?role=student&redirect=/coachs/${coach.id}`}
                variant="secondary"
                size="sm"
              >
                Créer un compte élève
              </ButtonLink>
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
