import Image from "next/image";
import Link from "next/link";
import type { Category, Coach } from "@prisma/client";
import { CategoryTag } from "@/components/CategoryTag";
import { cardClass } from "@/lib/ui-styles";

export function CoachList({
  coachs,
  emptyMessage,
}: {
  coachs: (Coach & { categories: Category[] })[];
  emptyMessage: React.ReactNode;
}) {
  if (coachs.length === 0) {
    return <p className="text-zinc-500">{emptyMessage}</p>;
  }

  return (
    <ul className="grid grid-cols-1 gap-4 lg:grid-cols-2">
      {coachs.map((coach) => (
        <li key={coach.id}>
          <Link
            href={`/coachs/${coach.id}`}
            className={`flex gap-4 p-5 transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:hover:border-brand/40 ${cardClass}`}
          >
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
              <h2 className="text-lg font-medium">{coach.name}</h2>
              <p className="mt-1 line-clamp-2 text-sm text-zinc-600 dark:text-zinc-400">
                {coach.bio}
              </p>
              <div className="mt-3 flex flex-wrap gap-2">
                {coach.categories.map((category) => (
                  <CategoryTag key={category.id} category={category} />
                ))}
              </div>
            </div>
          </Link>
        </li>
      ))}
    </ul>
  );
}
