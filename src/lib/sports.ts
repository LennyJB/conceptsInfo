import { Sport } from "@prisma/client";

export const SPORT_LABELS: Record<Sport, string> = {
  MUSCULATION: "Musculation",
  COURSE_A_PIED: "Course à pied",
  YOGA: "Yoga",
  TENNIS: "Tennis",
  FOOTBALL: "Football",
  BASKETBALL: "Basketball",
  NATATION: "Natation",
  BOXE: "Boxe",
  CROSSFIT: "CrossFit",
  CYCLISME: "Cyclisme",
  PILATES: "Pilates",
  ARTS_MARTIAUX: "Arts martiaux",
  DANSE: "Danse",
  ESCALADE: "Escalade",
  AUTRE: "Autre",
};

// Icônes stockées dans public/sports/*.svg (pas d'upload, images du projet).
export const SPORT_ICONS: Record<Sport, string> = {
  MUSCULATION: "/sports/musculation.svg",
  COURSE_A_PIED: "/sports/course-a-pied.svg",
  YOGA: "/sports/yoga.svg",
  TENNIS: "/sports/tennis.svg",
  FOOTBALL: "/sports/football.svg",
  BASKETBALL: "/sports/basketball.svg",
  NATATION: "/sports/natation.svg",
  BOXE: "/sports/boxe.svg",
  CROSSFIT: "/sports/crossfit.svg",
  CYCLISME: "/sports/cyclisme.svg",
  PILATES: "/sports/pilates.svg",
  ARTS_MARTIAUX: "/sports/arts-martiaux.svg",
  DANSE: "/sports/danse.svg",
  ESCALADE: "/sports/escalade.svg",
  AUTRE: "/sports/autre.svg",
};

// Couleur d'accent par sport (classes Tailwind bg-*), icône blanche dessus.
export const SPORT_COLORS: Record<Sport, string> = {
  MUSCULATION: "bg-orange-500",
  COURSE_A_PIED: "bg-emerald-500",
  YOGA: "bg-violet-500",
  TENNIS: "bg-lime-600",
  FOOTBALL: "bg-sky-500",
  BASKETBALL: "bg-amber-500",
  NATATION: "bg-cyan-500",
  BOXE: "bg-rose-500",
  CROSSFIT: "bg-red-600",
  CYCLISME: "bg-teal-500",
  PILATES: "bg-pink-400",
  ARTS_MARTIAUX: "bg-zinc-700",
  DANSE: "bg-fuchsia-500",
  ESCALADE: "bg-stone-500",
  AUTRE: "bg-gray-400",
};

export const ALL_SPORTS = Object.values(Sport);

// "Autre" n'est pas une vraie catégorie : c'est juste le mécanisme par lequel
// un coach propose un nouveau sport, en attente de validation par un admin
// (qui renomme alors le tag avec le nom précis). Elle ne doit donc jamais
// apparaître dans la grille de catégories ni être parcourable comme telle.
export const BROWSABLE_SPORTS: Sport[] = ALL_SPORTS.filter((sport) => sport !== "AUTRE");
