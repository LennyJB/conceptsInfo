import Link from "next/link";
import { prisma } from "@/lib/prisma";
import { CoachList } from "@/components/CoachList";
import { inlineLinkClass, textLinkClass } from "@/lib/ui-styles";

export const dynamic = "force-dynamic";

export default async function AllCoachsPage() {
  const coachs = await prisma.coach.findMany({
    where: { status: "APPROVED" },
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:px-10">
      <Link href="/" className={textLinkClass}>
        ← Retour aux catégories
      </Link>

      <h1 className="mt-4 mb-8 text-3xl font-semibold tracking-tight">
        Tous les coachs
      </h1>

      <CoachList
        coachs={coachs}
        emptyMessage={
          <>
            Aucun coach pour le moment.{" "}
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
