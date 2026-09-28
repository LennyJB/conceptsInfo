-- AlterEnum
BEGIN;
CREATE TYPE "MessageSender_new" AS ENUM ('STUDENT', 'COACH');
ALTER TABLE "Message" ALTER COLUMN "sender" TYPE "MessageSender_new" USING ("sender"::text::"MessageSender_new");
ALTER TYPE "MessageSender" RENAME TO "MessageSender_old";
ALTER TYPE "MessageSender_new" RENAME TO "MessageSender";
DROP TYPE "public"."MessageSender_old";
COMMIT;

-- DropIndex
DROP INDEX "Conversation_accessToken_key";

-- AlterTable
ALTER TABLE "Coach" ADD COLUMN     "emailNotifications" BOOLEAN NOT NULL DEFAULT true;

-- AlterTable
ALTER TABLE "Conversation" DROP COLUMN "accessToken",
DROP COLUMN "visitorEmail",
DROP COLUMN "visitorName",
ADD COLUMN     "notifyByEmail" BOOLEAN NOT NULL DEFAULT true,
ADD COLUMN     "studentId" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "Student" (
    "id" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "passwordHash" TEXT NOT NULL,
    "emailNotifications" BOOLEAN NOT NULL DEFAULT true,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Student_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "Student_email_key" ON "Student"("email");

-- CreateIndex
CREATE INDEX "Conversation_studentId_idx" ON "Conversation"("studentId");

-- CreateIndex
CREATE UNIQUE INDEX "Conversation_coachId_studentId_key" ON "Conversation"("coachId", "studentId");

-- AddForeignKey
ALTER TABLE "Conversation" ADD CONSTRAINT "Conversation_studentId_fkey" FOREIGN KEY ("studentId") REFERENCES "Student"("id") ON DELETE CASCADE ON UPDATE CASCADE;
