-- CreateTable
CREATE TABLE "QuizTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "platformId" INTEGER NOT NULL,
    "senderEmail" TEXT,
    "senderName" TEXT,
    "quizId" INTEGER NOT NULL,

    CONSTRAINT "QuizTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizTemplate" ADD CONSTRAINT "QuizTemplate_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizTemplate" ADD CONSTRAINT "QuizTemplate_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
