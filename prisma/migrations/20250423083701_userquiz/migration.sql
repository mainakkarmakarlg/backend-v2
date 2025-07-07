/*
  Warnings:

  - You are about to drop the `QuizQuestionAnswer` table. If the table is not empty, all the data it contains will be lost.
  - You are about to drop the `QuizUserAttempt` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "QuizQuestionAnswer" DROP CONSTRAINT "QuizQuestionAnswer_optionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestionAnswer" DROP CONSTRAINT "QuizQuestionAnswer_questionId_fkey";

-- DropForeignKey
ALTER TABLE "QuizQuestionAnswer" DROP CONSTRAINT "QuizQuestionAnswer_quizAttemptId_fkey";

-- DropForeignKey
ALTER TABLE "QuizUserAttempt" DROP CONSTRAINT "QuizUserAttempt_courseId_fkey";

-- DropForeignKey
ALTER TABLE "QuizUserAttempt" DROP CONSTRAINT "QuizUserAttempt_platFormId_fkey";

-- DropForeignKey
ALTER TABLE "QuizUserAttempt" DROP CONSTRAINT "QuizUserAttempt_quizId_fkey";

-- AlterTable
ALTER TABLE "PracticeQuestiontoFallNumber" ADD COLUMN     "userQuizAttemptId" INTEGER;

-- DropTable
DROP TABLE "QuizQuestionAnswer";

-- DropTable
DROP TABLE "QuizUserAttempt";

-- CreateTable
CREATE TABLE "QuizToUser" (
    "quizId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizToUser_pkey" PRIMARY KEY ("quizId","userId")
);

-- CreateTable
CREATE TABLE "UserQuizAnswer" (
    "id" SERIAL NOT NULL,
    "attemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "optionId" INTEGER,
    "timeTaken" INTEGER,
    "hasSubmitted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "quizUserAttemptId" INTEGER,

    CONSTRAINT "UserQuizAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER,
    "quizId" INTEGER NOT NULL,
    "hasSubmitted" BOOLEAN,
    "timeTaken" INTEGER,
    "platFormId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserQuizAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserQuizQuestionFlag" (
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "flagText" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "removed" BOOLEAN,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "id" SERIAL NOT NULL,

    CONSTRAINT "UserQuizQuestionFlag_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestionReport" (
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT,
    "tag" JSONB,

    CONSTRAINT "QuizQuestionReport_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateTable
CREATE TABLE "QuizQuestiontoFallNumber" (
    "questionId" INTEGER NOT NULL,
    "fallNumberId" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestiontoFallNumber_pkey" PRIMARY KEY ("questionId","fallNumberId")
);

-- AddForeignKey
ALTER TABLE "PracticeQuestiontoFallNumber" ADD CONSTRAINT "PracticeQuestiontoFallNumber_userQuizAttemptId_fkey" FOREIGN KEY ("userQuizAttemptId") REFERENCES "UserQuizAttempt"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizToUser" ADD CONSTRAINT "QuizToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizToUser" ADD CONSTRAINT "QuizToUser_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAnswer" ADD CONSTRAINT "UserQuizAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "UserQuizAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAnswer" ADD CONSTRAINT "UserQuizAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAnswer" ADD CONSTRAINT "UserQuizAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuizQuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAttempt" ADD CONSTRAINT "UserQuizAttempt_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAttempt" ADD CONSTRAINT "UserQuizAttempt_platFormId_fkey" FOREIGN KEY ("platFormId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizAttempt" ADD CONSTRAINT "UserQuizAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizQuestionFlag" ADD CONSTRAINT "UserQuizQuestionFlag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserQuizQuestionFlag" ADD CONSTRAINT "UserQuizQuestionFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionReport" ADD CONSTRAINT "QuizQuestionReport_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionReport" ADD CONSTRAINT "QuizQuestionReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestiontoFallNumber" ADD CONSTRAINT "QuizQuestiontoFallNumber_fallNumberId_fkey" FOREIGN KEY ("fallNumberId") REFERENCES "FallNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestiontoFallNumber" ADD CONSTRAINT "QuizQuestiontoFallNumber_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
