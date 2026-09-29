import Link from "next/link";
import { notFound } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { getCategoryBySlug } from "@/lib/categories";
import { CategoryIcon } from "@/components/CategoryIcon";
import { CoachList } from "@/components/CoachList";
import { inlineLinkClass, textLinkClass } from "@/lib/ui-styles";

export const dynamic = "force-dynamic";

export default async function CategoryPage(props: PageProps<"/categories/[slug]">) {
  const { slug } = await props.params;

  const category = await getCategoryBySlug(slug);
  if (!category || category.status !== "APPROVED") {
    notFound();
  }

  const coachs = await prisma.coach.findMany({
    where: { status: "APPROVED", categories: { some: { id: category.id } } },
    orderBy: { createdAt: "desc" },
    include: { categories: true },
  });

  return (
    <main className="mx-auto max-w-5xl px-6 py-16 md:px-10">
      <Link href="/" className={textLinkClass}>
        ← Retour aux catégories
      </Link>

      <div className="mt-4 mb-8 flex items-center gap-3">
        <CategoryIcon category={category} size={44} />
        <h1 className="text-3xl font-semibold tracking-tight">
          {category.label}
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
