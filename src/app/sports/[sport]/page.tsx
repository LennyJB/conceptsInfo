import Link from "next/link";
import { notFound } from "next/navigation";
import type { Sport } from "@prisma/client";
import { prisma } from "@/lib/prisma";
import { ALL_SPORTS, SPORT_LABELS } from "@/lib/sports";
import { SportIcon } from "@/components/SportIcon";
import { CoachList } from "@/components/CoachList";
import { inlineLinkClass, textLinkClass } from "@/lib/ui-styles";

export const dynamic = "force-dynamic";

export default async function SportPage(props: PageProps<"/sports/[sport]">) {
  const { sport: sportParam } = await props.params;

  if (!ALL_SPORTS.includes(sportParam as Sport)) {
    notFound();
  }
  const sport = sportParam as Sport;

  const coachs = await prisma.coach.findMany({
    where: { status: "APPROVED", sports: { has: sport } },
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:px-10">
      <Link href="/" className={textLinkClass}>
        ← Retour aux catégories
      </Link>

      <div className="mt-4 mb-8 flex items-center gap-3">
        <SportIcon sport={sport} size={44} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {SPORT_LABELS[sport]}
        </h1>
      </div>

      <CoachList
        coachs={coachs}
        emptyMessage={
          <>
            Aucun coach pour le moment dans cette catégorie.{" "}
            <Link href="/compte/inscription?role=coach" className={inlineLinkClass}>
              Soyez le premier à proposer votre coaching
            </Link>
            .
          </>
        }
      />
    </main>
  );
}
