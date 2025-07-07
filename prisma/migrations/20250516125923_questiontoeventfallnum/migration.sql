/*
  Warnings:

  - You are about to drop the column `userQuizAttemptId` on the `PracticeQuestiontoFallNumber` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "PracticeQuestiontoFallNumber" DROP CONSTRAINT "PracticeQuestiontoFallNumber_userQuizAttemptId_fkey";

-- AlterTable
ALTER TABLE "PracticeQuestiontoFallNumber" DROP COLUMN "userQuizAttemptId";
