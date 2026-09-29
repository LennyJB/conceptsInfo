import Image from "next/image";
import Link from "next/link";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveCoach, deleteCoach } from "@/lib/admin-actions";
import { prisma } from "@/lib/prisma";
import { CategoryTag } from "@/components/CategoryTag";
import { Button } from "@/components/ui/Button";
import { cardClass } from "@/lib/ui-styles";
import { AdminLoginForm } from "./AdminLoginForm";
import { AdminNav } from "./AdminNav";

export const dynamic = "force-dynamic";

export default async function AdminPage() {
  const authenticated = await isAdminAuthenticated();

  if (!authenticated) {
    return (
      <main className="mx-auto max-w-sm px-6 py-16">
        <h1 className="text-2xl font-semibold tracking-tight">Administration</h1>
        <AdminLoginForm />
      </main>
    );
  }

  const pendingCoachs = await prisma.coach.findMany({
    where: { status: "PENDING" },
    orderBy: { createdAt: "asc" },
    include: { categories: true },
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <AdminNav active="/admin" />

      <h1 className="text-2xl font-semibold tracking-tight">
        Profils en attente ({pendingCoachs.length})
      </h1>

      {pendingCoachs.length === 0 ? (
        <p className="mt-8 text-zinc-500">Aucun profil en attente.</p>
      ) : (
        <ul className="mt-8 flex flex-col gap-4">
          {pendingCoachs.map((coach) => (
            <li key={coach.id} className={`flex gap-4 p-5 ${cardClass}`}>
              {coach.photoUrl ? (
                <Image
                  src={coach.photoUrl}
                  alt={coach.name}
                  width={64}
                  height={64}
                  className="h-16 w-16 shrink-0 rounded-full object-cover"
                />
              ) : (
                <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-brand/10 text-lg font-medium text-brand dark:bg-brand/20">
                  {coach.name.charAt(0).toUpperCase()}
                </div>
              )}
              <div className="min-w-0 flex-1">
                <div className="flex items-baseline justify-between gap-4">
                  <Link href={`/admin/coachs/${coach.id}`} className="font-medium hover:underline">
                    {coach.name}
                  </Link>
                  <span className="text-sm text-zinc-500">{coach.email}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {coach.bio}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {coach.categories.map((category) => (
                    <CategoryTag key={category.id} category={category} />
                  ))}
                </div>
                {coach.categories.some((c) => c.status === "PENDING") && (
                  <p className="mt-2 text-xs text-amber-600 dark:text-amber-400">
                    Ce profil propose une nouvelle catégorie en attente — gérez-la dans{" "}
                    <Link href="/admin/categories" className="underline">
                      Catégories
                    </Link>
                    .
                  </p>
                )}
                <form action={approveCoach.bind(null, coach.id)} className="mt-3 flex flex-wrap items-center gap-3">
                  <Button type="submit" size="sm">
                    Approuver
                  </Button>
                  <Button type="submit" variant="secondary" size="sm" formAction={deleteCoach.bind(null, coach.id)}>
                    Rejeter
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}
    </main>
  );
}
