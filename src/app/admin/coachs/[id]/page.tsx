import Image from "next/image";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveCoach, deleteCoach } from "@/lib/admin-actions";
import { prisma } from "@/lib/prisma";
import { CategoryTag } from "@/components/CategoryTag";
import { Button } from "@/components/ui/Button";
import { cardClass, textLinkClass } from "@/lib/ui-styles";
import { AdminNav } from "../../AdminNav";
import { EditCoachAdminForm } from "./EditCoachAdminForm";

export const dynamic = "force-dynamic";

const STATUS_STYLES: Record<string, string> = {
  APPROVED: "text-emerald-600 dark:text-emerald-400",
  PENDING: "text-amber-600 dark:text-amber-400",
};

const STATUS_LABELS: Record<string, string> = {
  APPROVED: "Publié dans l'annuaire",
  PENDING: "En attente de validation",
};

export default async function AdminCoachDetailPage(
  props: PageProps<"/admin/coachs/[id]">
) {
  const authenticated = await isAdminAuthenticated();
  if (!authenticated) redirect("/admin");

  const { id } = await props.params;
  const [coach, allCategories] = await Promise.all([
    prisma.coach.findUnique({ where: { id }, include: { categories: true } }),
    prisma.category.findMany({ orderBy: { label: "asc" } }),
  ]);

  if (!coach) notFound();

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <AdminNav active="/admin/users" />

      <Link href="/admin/users" className={textLinkClass}>
        ← Retour aux utilisateurs
      </Link>

      <div className="mt-4 flex items-center gap-5">
        {coach.photoUrl ? (
          <Image
            src={coach.photoUrl}
            alt={coach.name}
            width={80}
            height={80}
            className="h-20 w-20 shrink-0 rounded-full object-cover"
          />
        ) : (
          <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-full bg-brand/10 text-2xl font-medium text-brand dark:bg-brand/20">
            {coach.name.charAt(0).toUpperCase()}
          </div>
        )}
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">{coach.name}</h1>
          <span className={`text-sm font-medium ${STATUS_STYLES[coach.status]}`}>
            {STATUS_LABELS[coach.status]}
          </span>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        {coach.categories.map((category) => (
          <CategoryTag key={category.id} category={category} />
        ))}
      </div>

      {coach.videoUrl && (
        <video src={coach.videoUrl} controls className="mt-6 w-full rounded-xl bg-black" />
      )}

      <div className={`mt-6 flex flex-wrap items-center gap-3 p-4 ${cardClass}`}>
        {coach.status === "PENDING" ? (
          <form action={approveCoach.bind(null, coach.id)}>
            <Button type="submit" size="sm">
              Approuver
            </Button>
          </form>
        ) : null}
        <form action={deleteCoach.bind(null, coach.id)}>
          <Button type="submit" variant="secondary" size="sm">
            Supprimer ce compte
          </Button>
        </form>
      </div>

      <h2 className="mt-10 text-lg font-medium">Modifier le profil</h2>
      <EditCoachAdminForm coach={coach} allCategories={allCategories} />
    </main>
  );
}
