-- CreateTable
CREATE TABLE "QuizUserCheating" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "offense" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizUserCheating_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "QuizUserCheating" ADD CONSTRAINT "QuizUserCheating_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizUserCheating" ADD CONSTRAINT "QuizUserCheating_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "UserQuizAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizUserCheating" ADD CONSTRAINT "QuizUserCheating_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
