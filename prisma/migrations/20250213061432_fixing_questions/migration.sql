/*
  Warnings:

  - Added the required column `questionId` to the `PracticeQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `PracticeQuestion` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserPracticeAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserPracticeAttempt` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserPracticeQuestionFlag` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PracticeQuestion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "questionId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserPracticeAnswer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "timeTaken" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserPracticeAttempt" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "hasSubmitted" BOOLEAN,
ADD COLUMN     "timeTaken" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserPracticeQuestionFlag" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "removed" BOOLEAN,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "PracticeQuestion" ADD CONSTRAINT "PracticeQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
