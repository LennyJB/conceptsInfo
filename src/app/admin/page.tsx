import Image from "next/image";
import { isAdminAuthenticated } from "@/lib/admin-auth";
import { approveCoach, rejectCoach, adminLogout } from "@/lib/admin-actions";
import { prisma } from "@/lib/prisma";
import { BROWSABLE_SPORTS, SPORT_LABELS } from "@/lib/sports";
import { getSportPhotoUrl } from "@/lib/sport-photos";
import { SportTag } from "@/components/SportTag";
import { SportIcon } from "@/components/SportIcon";
import { Button } from "@/components/ui/Button";
import { cardClass, textLinkClass } from "@/lib/ui-styles";
import { AdminLoginForm } from "./AdminLoginForm";
import { CategoryPhotoUpload } from "./CategoryPhotoUpload";

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
  });

  return (
    <main className="mx-auto max-w-3xl px-6 py-16">
      <div className="flex items-center justify-between gap-4">
        <h1 className="text-2xl font-semibold tracking-tight">
          Profils en attente ({pendingCoachs.length})
        </h1>
        <form action={adminLogout}>
          <button type="submit" className={textLinkClass}>
            Se déconnecter
          </button>
        </form>
      </div>

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
                  <h2 className="font-medium">{coach.name}</h2>
                  <span className="text-sm text-zinc-500">{coach.email}</span>
                </div>
                <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                  {coach.bio}
                </p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {coach.sports.map((sport) => (
                    <SportTag key={sport} sport={sport} customLabel={coach.customSport} />
                  ))}
                </div>
                <form action={approveCoach.bind(null, coach.id)} className="mt-3 flex flex-wrap items-center gap-3">
                  {coach.sports.includes("AUTRE") && (
                    <label className="flex items-center gap-2 text-sm">
                      <span className="text-zinc-500">Nom du sport « Autre » :</span>
                      <input
                        type="text"
                        name="customSport"
                        defaultValue={coach.customSport ?? ""}
                        required
                        className="rounded-lg border border-black/[.08] px-2.5 py-1 text-sm outline-none transition-colors focus:border-brand dark:border-white/[.145] dark:bg-transparent dark:focus:border-brand"
                      />
                    </label>
                  )}
                  <Button type="submit" size="sm">
                    Approuver
                  </Button>
                  <Button type="submit" variant="secondary" size="sm" formAction={rejectCoach.bind(null, coach.id)}>
                    Rejeter
                  </Button>
                </form>
              </div>
            </li>
          ))}
        </ul>
      )}

      <h2 className="mt-12 text-lg font-medium">Photos des catégories</h2>
      <p className="mt-1 text-sm text-zinc-500">
        Ajoutez une photo par sport pour l&apos;afficher sur les cartes de
        l&apos;accueil (sinon une icône colorée est utilisée par défaut).
      </p>
      <ul className="mt-4 flex flex-col divide-y divide-black/[.08] dark:divide-white/[.08]">
        {BROWSABLE_SPORTS.map((sport) => {
          const photoUrl = getSportPhotoUrl(sport);
          return (
            <li key={sport} className="flex items-center gap-3 py-3">
              {photoUrl ? (
                <Image
                  src={photoUrl}
                  alt={SPORT_LABELS[sport]}
                  width={40}
                  height={40}
                  className="h-10 w-10 shrink-0 rounded-lg object-cover"
                />
              ) : (
                <SportIcon sport={sport} size={40} />
              )}
              <span className="w-32 shrink-0 text-sm font-medium">
                {SPORT_LABELS[sport]}
              </span>
              <CategoryPhotoUpload sport={sport} />
            </li>
          );
        })}
      </ul>
    </main>
  );
}
