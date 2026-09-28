/*
  Warnings:

  - You are about to drop the column `skills` on the `Coach` table. All the data in the column will be lost.

*/
-- CreateEnum
CREATE TYPE "CoachStatus" AS ENUM ('PENDING', 'APPROVED');

-- CreateEnum
CREATE TYPE "Sport" AS ENUM ('MUSCULATION', 'COURSE_A_PIED', 'YOGA', 'TENNIS', 'FOOTBALL', 'BASKETBALL', 'NATATION', 'BOXE', 'CROSSFIT', 'CYCLISME', 'PILATES', 'ARTS_MARTIAUX', 'DANSE', 'ESCALADE', 'AUTRE');

-- AlterTable
ALTER TABLE "Coach" DROP COLUMN "skills",
ADD COLUMN     "instagramUrl" TEXT,
ADD COLUMN     "photoUrl" TEXT,
ADD COLUMN     "sports" "Sport"[],
ADD COLUMN     "status" "CoachStatus" NOT NULL DEFAULT 'PENDING',
ADD COLUMN     "tiktokUrl" TEXT,
ADD COLUMN     "videoUrl" TEXT,
ADD COLUMN     "websiteUrl" TEXT,
ADD COLUMN     "youtubeUrl" TEXT;
