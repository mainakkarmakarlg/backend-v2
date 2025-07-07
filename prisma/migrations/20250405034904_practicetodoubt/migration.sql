/*
  Warnings:

  - You are about to drop the column `order` on the `Quiz` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `Quiz` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Quiz" DROP COLUMN "order",
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "duration" INTEGER,
ADD COLUMN     "isActive" BOOLEAN,
ADD COLUMN     "quizId" INTEGER,
ADD COLUMN     "resultType" TEXT,
ADD COLUMN     "timeType" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "name" DROP NOT NULL;

-- CreateTable
CREATE TABLE "QuizQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "attachment" JSONB,
    "quizId" INTEGER NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtQuestionToPracticeQuestion" (
    "practiceId" INTEGER NOT NULL,
    "doubtId" INTEGER NOT NULL,

    CONSTRAINT "DoubtQuestionToPracticeQuestion_pkey" PRIMARY KEY ("practiceId","doubtId")
);

-- CreateIndex
CREATE UNIQUE INDEX "DoubtQuestionToPracticeQuestion_doubtId_key" ON "DoubtQuestionToPracticeQuestion"("doubtId");

-- AddForeignKey
ALTER TABLE "Quiz" ADD CONSTRAINT "Quiz_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestionToPracticeQuestion" ADD CONSTRAINT "DoubtQuestionToPracticeQuestion_practiceId_fkey" FOREIGN KEY ("practiceId") REFERENCES "PracticeQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestionToPracticeQuestion" ADD CONSTRAINT "DoubtQuestionToPracticeQuestion_doubtId_fkey" FOREIGN KEY ("doubtId") REFERENCES "DoubtQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
