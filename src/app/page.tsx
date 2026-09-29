import Link from "next/link";
import { getBrowsableCategories } from "@/lib/categories";
import { CategoryCard } from "@/components/CategoryCard";
import { ButtonLink } from "@/components/ui/Button";
import { cardClass } from "@/lib/ui-styles";

export const dynamic = "force-dynamic";

export default async function Home() {
  const categories = await getBrowsableCategories();

  return (
    <main className="mx-auto max-w-[1600px] px-6 py-12 md:px-10 md:py-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-semibold tracking-tight">
            Coachs sportifs
          </h1>
          <p className="mt-2 text-zinc-600 dark:text-zinc-400">
            Trouvez un coach près de chez vous, par sport.
          </p>
        </div>
        <ButtonLink href="/compte/inscription?role=coach" className="shrink-0">
          Devenir coach
        </ButtonLink>
      </div>

      <Link
        href="/coachs"
        className={`mb-10 flex items-center justify-between px-5 py-4 text-sm font-medium transition-colors hover:border-brand/40 hover:text-brand dark:hover:border-brand/40 ${cardClass}`}
      >
        Voir tous les coachs
        <span aria-hidden>→</span>
      </Link>

      <h2 className="mb-4 text-sm font-medium text-zinc-500">
        Parcourir par sport
      </h2>
      <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
        {categories.map((category) => (
          <CategoryCard key={category.id} category={category} />
        ))}
      </div>
    </main>
  );
}
