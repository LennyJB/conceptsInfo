-- CreateEnum
CREATE TYPE "CategoryStatus" AS ENUM ('PENDING', 'APPROVED');

-- CreateTable
CREATE TABLE "Category" (
    "id" TEXT NOT NULL,
    "slug" TEXT NOT NULL,
    "label" TEXT NOT NULL,
    "color" TEXT NOT NULL DEFAULT 'bg-gray-400',
    "iconUrl" TEXT,
    "photoUrl" TEXT,
    "status" "CategoryStatus" NOT NULL DEFAULT 'PENDING',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Category_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "_CoachCategories" (
    "A" TEXT NOT NULL,
    "B" TEXT NOT NULL,

    CONSTRAINT "_CoachCategories_AB_pkey" PRIMARY KEY ("A","B")
);

-- CreateIndex
CREATE UNIQUE INDEX "Category_slug_key" ON "Category"("slug");

-- CreateIndex
CREATE INDEX "_CoachCategories_B_index" ON "_CoachCategories"("B");

-- AddForeignKey
ALTER TABLE "_CoachCategories" ADD CONSTRAINT "_CoachCategories_A_fkey" FOREIGN KEY ("A") REFERENCES "Category"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "_CoachCategories" ADD CONSTRAINT "_CoachCategories_B_fkey" FOREIGN KEY ("B") REFERENCES "Coach"("id") ON DELETE CASCADE ON UPDATE CASCADE;

-- Seed the 14 curated categories (former Sport enum values), approved and
-- carrying their existing icon. photoUrl is left null here; a one-off script
-- backfills it from the files that already exist under public/uploads/categories.
INSERT INTO "Category" ("id", "slug", "label", "color", "iconUrl", "status") VALUES
  (gen_random_uuid()::text, 'musculation',    'Musculation',   'bg-orange-500',  '/sports/musculation.svg',    'APPROVED'),
  (gen_random_uuid()::text, 'course-a-pied',  'Course à pied', 'bg-emerald-500', '/sports/course-a-pied.svg',  'APPROVED'),
  (gen_random_uuid()::text, 'yoga',           'Yoga',          'bg-violet-500',  '/sports/yoga.svg',           'APPROVED'),
  (gen_random_uuid()::text, 'tennis',         'Tennis',        'bg-lime-600',    '/sports/tennis.svg',         'APPROVED'),
  (gen_random_uuid()::text, 'football',       'Football',      'bg-sky-500',     '/sports/football.svg',      'APPROVED'),
  (gen_random_uuid()::text, 'basketball',     'Basketball',    'bg-amber-500',   '/sports/basketball.svg',    'APPROVED'),
  (gen_random_uuid()::text, 'natation',       'Natation',      'bg-cyan-500',    '/sports/natation.svg',      'APPROVED'),
  (gen_random_uuid()::text, 'boxe',           'Boxe',          'bg-rose-500',    '/sports/boxe.svg',           'APPROVED'),
  (gen_random_uuid()::text, 'crossfit',       'CrossFit',      'bg-red-600',     '/sports/crossfit.svg',       'APPROVED'),
  (gen_random_uuid()::text, 'cyclisme',       'Cyclisme',      'bg-teal-500',    '/sports/cyclisme.svg',       'APPROVED'),
  (gen_random_uuid()::text, 'pilates',        'Pilates',       'bg-pink-400',    '/sports/pilates.svg',        'APPROVED'),
  (gen_random_uuid()::text, 'arts-martiaux',  'Arts martiaux', 'bg-zinc-700',    '/sports/arts-martiaux.svg',  'APPROVED'),
  (gen_random_uuid()::text, 'danse',          'Danse',         'bg-fuchsia-500', '/sports/danse.svg',          'APPROVED'),
  (gen_random_uuid()::text, 'escalade',       'Escalade',      'bg-stone-500',   '/sports/escalade.svg',       'APPROVED');

-- Migrate each coach's old Sport[] enum values onto the matching new category.
INSERT INTO "_CoachCategories" ("A", "B")
SELECT cat.id, coach.id
FROM "Coach" coach
CROSS JOIN LATERAL unnest(coach."sports") AS s(sport_value)
JOIN "Category" cat ON cat.slug = (
  CASE s.sport_value
    WHEN 'MUSCULATION' THEN 'musculation'
    WHEN 'COURSE_A_PIED' THEN 'course-a-pied'
    WHEN 'YOGA' THEN 'yoga'
    WHEN 'TENNIS' THEN 'tennis'
    WHEN 'FOOTBALL' THEN 'football'
    WHEN 'BASKETBALL' THEN 'basketball'
    WHEN 'NATATION' THEN 'natation'
    WHEN 'BOXE' THEN 'boxe'
    WHEN 'CROSSFIT' THEN 'crossfit'
    WHEN 'CYCLISME' THEN 'cyclisme'
    WHEN 'PILATES' THEN 'pilates'
    WHEN 'ARTS_MARTIAUX' THEN 'arts-martiaux'
    WHEN 'DANSE' THEN 'danse'
    WHEN 'ESCALADE' THEN 'escalade'
    ELSE NULL
  END
)
ON CONFLICT DO NOTHING;

-- Turn each coach's old free-text "Autre" proposal into its own approved
-- category (it had already gone through admin approval under the old system),
-- reusing one category per distinct name.
INSERT INTO "Category" ("id", "slug", "label", "color", "status")
SELECT DISTINCT ON (slug) gen_random_uuid()::text, slug, label, 'bg-gray-400', 'APPROVED'
FROM (
  SELECT
    trim(coach."customSport") AS label,
    lower(regexp_replace(regexp_replace(trim(coach."customSport"), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g')) AS slug
  FROM "Coach" coach
  WHERE coach."customSport" IS NOT NULL
    AND trim(coach."customSport") <> ''
    AND 'AUTRE' = ANY(coach."sports")
) proposals
ON CONFLICT (slug) DO NOTHING;

INSERT INTO "_CoachCategories" ("A", "B")
SELECT cat.id, coach.id
FROM "Coach" coach
JOIN "Category" cat ON cat.slug = lower(regexp_replace(regexp_replace(trim(coach."customSport"), '[^a-zA-Z0-9]+', '-', 'g'), '(^-+|-+$)', '', 'g'))
WHERE coach."customSport" IS NOT NULL
  AND trim(coach."customSport") <> ''
  AND 'AUTRE' = ANY(coach."sports")
ON CONFLICT DO NOTHING;

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "customSport",
DROP COLUMN "sports";

-- DropEnum
DROP TYPE "Sport";
