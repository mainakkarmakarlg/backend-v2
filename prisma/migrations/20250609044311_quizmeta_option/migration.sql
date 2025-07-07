/*
  Warnings:

  - You are about to drop the `QuizOpion` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuizOpion" DROP CONSTRAINT "QuizOpion_quizId_fkey";

-- DropTable
DROP TABLE "QuizOpion";

-- CreateTable
CREATE TABLE "QuizMetaOption" (
    "id" SERIAL NOT NULL,
    "valueJson" JSONB,
    "valueText" TEXT,
    "quizId" INTEGER NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizMetaOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizMetaOption" ADD CONSTRAINT "QuizMetaOption_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
