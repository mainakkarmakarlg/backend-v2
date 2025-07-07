-- AlterTable
ALTER TABLE "QuizMeta" ADD COLUMN     "regEndTime" TIMESTAMP(3),
ADD COLUMN     "regStartTime" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "QuizOpion" (
    "id" SERIAL NOT NULL,
    "valueJson" JSONB,
    "valueText" TEXT,
    "quizId" INTEGER NOT NULL,
    "type" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizOpion_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizOpion" ADD CONSTRAINT "QuizOpion_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
