import { Sport } from "@prisma/client";
import { describe, expect, it } from "vitest";
import { ALL_SPORTS, BROWSABLE_SPORTS, SPORT_COLORS, SPORT_ICONS, SPORT_LABELS } from "./sports";

const enumValues = Object.values(Sport);

describe("sports data", () => {
  it("ALL_SPORTS matches the Prisma Sport enum exactly", () => {
    expect(new Set(ALL_SPORTS)).toEqual(new Set(enumValues));
    expect(ALL_SPORTS).toHaveLength(enumValues.length);
  });

  it("BROWSABLE_SPORTS excludes AUTRE (it's not a real category)", () => {
    expect(BROWSABLE_SPORTS).not.toContain("AUTRE");
    expect(BROWSABLE_SPORTS).toHaveLength(ALL_SPORTS.length - 1);
  });

  it("every sport has a label, an icon, and an accent color", () => {
    for (const sport of enumValues) {
      expect(SPORT_LABELS[sport], `label for ${sport}`).toBeTruthy();
      expect(SPORT_ICONS[sport], `icon for ${sport}`).toMatch(/^\/sports\/.+\.svg$/);
      expect(SPORT_COLORS[sport], `color for ${sport}`).toMatch(/^bg-/);
    }
  });

  it("uses a distinct accent color per sport", () => {
    const colors = Object.values(SPORT_COLORS);
    expect(new Set(colors).size).toBe(colors.length);
  });
});
