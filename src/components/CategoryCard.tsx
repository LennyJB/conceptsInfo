import Image from "next/image";
import Link from "next/link";
import type { Sport } from "@prisma/client";
import { SPORT_LABELS, SPORT_COLORS, SPORT_ICONS } from "@/lib/sports";
import { getSportPhotoUrl } from "@/lib/sport-photos";

export function CategoryCard({ sport }: { sport: Sport }) {
  const photoUrl = getSportPhotoUrl(sport);
  const label = SPORT_LABELS[sport];

  return (
    <Link
      href={`/sports/${sport}`}
      className="group overflow-hidden rounded-2xl border border-black/[.08] bg-surface shadow-sm transition-all hover:-translate-y-0.5 hover:border-brand/40 hover:shadow-md dark:border-white/[.145] dark:shadow-none dark:hover:border-brand/40"
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        {photoUrl ? (
          <Image
            src={photoUrl}
            alt=""
            fill
            sizes="(max-width: 640px) 100vw, 50vw"
            className="object-cover transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          <div
            className={`flex h-full w-full items-center justify-center ${SPORT_COLORS[sport]}`}
          >
            {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG icon, next/image adds no value here */}
            <img src={SPORT_ICONS[sport]} alt="" aria-hidden className="h-24 w-24" />
          </div>
        )}
      </div>
      <div className="flex items-center justify-between gap-3 p-5">
        <span className="text-lg font-semibold">{label}</span>
        <span
          aria-hidden
          className="text-zinc-400 transition-transform group-hover:translate-x-1 group-hover:text-brand dark:text-zinc-600"
        >
          →
        </span>
      </div>
    </Link>
  );
}
