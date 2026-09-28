import { SPORT_COLORS, SPORT_ICONS } from "@/lib/sports";
import type { Sport } from "@prisma/client";

export function SportIcon({ sport, size = 28 }: { sport: Sport; size?: number }) {
  return (
    <span
      className={`inline-flex shrink-0 items-center justify-center rounded-full ${SPORT_COLORS[sport]}`}
      style={{ width: size, height: size }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element -- tiny static SVG icon, next/image adds no value here */}
      <img
        src={SPORT_ICONS[sport]}
        alt=""
        aria-hidden
        style={{ width: size * 0.58, height: size * 0.58 }}
      />
    </span>
  );
}
