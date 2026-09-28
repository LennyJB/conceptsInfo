import { SPORT_LABELS } from "@/lib/sports";
import type { Sport } from "@prisma/client";
import { SportIcon } from "./SportIcon";

export function SportTag({
  sport,
  customLabel,
}: {
  sport: Sport;
  customLabel?: string | null;
}) {
  const label = sport === "AUTRE" && customLabel ? customLabel : SPORT_LABELS[sport];
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-black/[.06] py-1 pr-2.5 pl-1 text-xs dark:bg-white/[.08]">
      <SportIcon sport={sport} size={18} />
      {label}
    </span>
  );
}
