-- DropForeignKey
ALTER TABLE "PracticeQuestion" DROP CONSTRAINT "PracticeQuestion_questionId_fkey";

-- AlterTable
ALTER TABLE "PracticeQuestion" ALTER COLUMN "questionId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PracticeQuestion" ADD CONSTRAINT "PracticeQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;
