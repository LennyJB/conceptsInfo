import Link from "next/link";
import { redirect } from "next/navigation";
import { getCurrentCoach } from "@/lib/coach-auth";
import { prisma } from "@/lib/prisma";
import { getBrowsableCategories } from "@/lib/categories";
import { textLinkClass } from "@/lib/ui-styles";
import { EditProfileForm } from "./EditProfileForm";

export const dynamic = "force-dynamic";

export default async function EditProfilePage() {
  const currentCoach = await getCurrentCoach();
  if (!currentCoach) redirect("/compte/login");

  const [coach, categories] = await Promise.all([
    prisma.coach.findUniqueOrThrow({
      where: { id: currentCoach.id },
      include: { categories: true },
    }),
    getBrowsableCategories(),
  ]);

  return (
    <main className="mx-auto max-w-md px-6 py-16">
      <Link href="/compte" className={textLinkClass}>
        ← Retour à mon compte
      </Link>
      <h1 className="mt-6 text-2xl font-semibold tracking-tight">
        Modifier mon profil
      </h1>
      <p className="mt-2 text-sm text-zinc-600 dark:text-zinc-400">
        Ces informations sont visibles publiquement dans l&apos;annuaire une fois votre profil
        approuvé.
      </p>

      <EditProfileForm coach={coach} categories={categories} />
    </main>
  );
}
