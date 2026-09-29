import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCoach } from "@/lib/coach-auth";
import { getCurrentStudent } from "@/lib/student-auth";
import { logout } from "@/lib/login-actions";
import { toggleCoachEmailNotifications } from "@/lib/coach-actions";
import { toggleStudentEmailNotifications } from "@/lib/student-actions";
import { prisma } from "@/lib/prisma";
import { CategoryTag } from "@/components/CategoryTag";
import { ButtonLink } from "@/components/ui/Button";
import { cardClass, inlineLinkClass, textLinkClass } from "@/lib/ui-styles";

export const dynamic = "force-dynamic";

function Header({
  title,
  subtitle,
}: {
  title: string;
  subtitle: React.ReactNode;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="mt-1 text-sm text-zinc-500">{subtitle}</p>
      </div>
      <form action={logout}>
        <button type="submit" className={textLinkClass}>
          Se déconnecter
        </button>
      </form>
    </div>
  );
}

function ConversationList({
  conversations,
  basePath,
  viewerRole,
}: {
  conversations: {
    id: string;
    otherPartyName: string;
    lastMessage?: { body: string; createdAt: Date };
  }[];
  basePath: string;
  viewerRole: "coach" | "student";
}) {
  if (conversations.length === 0) {
    return (
      <p className="mt-4 text-zinc-500">
        {viewerRole === "student" ? (
          <>
            Vous n&apos;avez pas encore contacté de coach.{" "}
            <Link href="/" className={inlineLinkClass}>
              Parcourir l&apos;annuaire
            </Link>
            .
          </>
        ) : (
          "Aucun message pour le moment. Les élèves qui vous contactent apparaîtront ici."
        )}
      </p>
    );
  }

  return (
    <ul className="mt-4 flex flex-col gap-3">
      {conversations.map((c) => (
        <li key={c.id}>
          <Link
            href={`${basePath}/${c.id}`}
            className={`block p-4 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:hover:border-brand/40 ${cardClass}`}
          >
            <div className="flex items-baseline justify-between gap-4">
              <span className="font-medium">{c.otherPartyName}</span>
              <span className="shrink-0 text-xs text-zinc-500">
                {c.lastMessage?.createdAt.toLocaleDateString("fr-FR")}
              </span>
            </div>
            <p className="mt-1 line-clamp-1 text-sm text-zinc-600 dark:text-zinc-400">
              {c.lastMessage?.body}
            </p>
          </Link>
        </li>
      ))}
    </ul>
  );
}

export default async function AccountPage() {
  const [coach, student] = await Promise.all([getCurrentCoach(), getCurrentStudent()]);

  if (!coach && !student) redirect("/compte/login");

  if (coach) {
    const [conversations, coachWithCategories] = await Promise.all([
      prisma.conversation.findMany({
        where: { coachId: coach.id },
        orderBy: { createdAt: "desc" },
        include: { student: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
      }),
      prisma.coach.findUniqueOrThrow({ where: { id: coach.id }, include: { categories: true } }),
    ]);

    return (
      <main className="mx-auto max-w-3xl px-6 py-16">
        <Link href="/" className={textLinkClass}>
          ← Voir les catégories
        </Link>

        <div className="mt-4">
          <Header
            title={`Bonjour ${coach.name}`}
            subtitle={
              coach.status === "APPROVED" ? (
                <span className="text-emerald-600 dark:text-emerald-400">
                  Profil publié dans l&apos;annuaire
                </span>
              ) : (
                <span className="text-amber-600 dark:text-amber-400">
                  Profil en attente de validation
                </span>
              )
            }
          />
        </div>

        <div className={`mt-6 p-4 text-sm ${cardClass}`}>
          <h2 className="font-medium">Mes informations</h2>
          <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-1 text-zinc-600 dark:text-zinc-400">
            <dt>Email</dt>
            <dd>{coach.email}</dd>
            {coach.phone && (
              <>
                <dt>Téléphone</dt>
                <dd>{coach.phone}</dd>
              </>
            )}
          </dl>
          <div className="mt-3 flex flex-wrap gap-2">
            {coachWithCategories.categories.map((category) => (
              <CategoryTag key={category.id} category={category} />
            ))}
          </div>
        </div>

        <div className="mt-4 flex flex-wrap items-center gap-4">
          <ButtonLink href="/compte/profil" variant="secondary" size="sm">
            Modifier mon profil
          </ButtonLink>
          <form action={toggleCoachEmailNotifications}>
            <button type="submit" className={`text-xs ${textLinkClass}`}>
              {coach.emailNotifications
                ? "🔔 Emails de notification activés"
                : "🔕 Emails de notification désactivés"}
            </button>
          </form>
        </div>

        <h2 className="mt-10 text-lg font-medium">
          Messages ({conversations.length})
        </h2>
        <ConversationList
          basePath="/compte/conversations"
          viewerRole="coach"
          conversations={conversations.map((c) => ({
            id: c.id,
            otherPartyName: c.student.name,
            lastMessage: c.messages[0],
          }))}
        />
      </main>
    );
  }

  // student
  const conversations = await prisma.conversation.findMany({
    where: { studentId: student!.id },
    orderBy: { createdAt: "desc" },
    include: { coach: true, messages: { orderBy: { createdAt: "desc" }, take: 1 } },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <Link href="/" className={textLinkClass}>
        ← Voir les catégories
      </Link>

      <div className="mt-4">
        <Header title={`Bonjour ${student!.name}`} subtitle={student!.email} />
      </div>

      <form action={toggleStudentEmailNotifications} className="mt-4">
        <button type="submit" className={`text-xs ${textLinkClass}`}>
          {student!.emailNotifications
            ? "🔔 Emails de notification activés"
            : "🔕 Emails de notification désactivés"}
        </button>
      </form>

      <h2 className="mt-10 text-lg font-medium">
        Mes conversations ({conversations.length})
      </h2>
      <ConversationList
        basePath="/compte/conversations"
        viewerRole="student"
        conversations={conversations.map((c) => ({
          id: c.id,
          otherPartyName: c.coach.name,
          lastMessage: c.messages[0],
        }))}
      />
    </main>
  );
}
