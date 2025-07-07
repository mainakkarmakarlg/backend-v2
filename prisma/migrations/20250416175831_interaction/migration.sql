/*
  Warnings:

  - You are about to drop the column `leadId` on the `UserLeadInteraction` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserLeadInteraction" DROP CONSTRAINT "UserLeadInteraction_leadId_fkey";

-- AlterTable
ALTER TABLE "Quiz" ADD COLUMN     "accessType" TEXT,
ADD COLUMN     "attemptType" TEXT,
ADD COLUMN     "endTime" TIMESTAMP(3),
ADD COLUMN     "notified" BOOLEAN,
ADD COLUMN     "startTime" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "QuizQuestion" ADD COLUMN     "attribute" TEXT,
ADD COLUMN     "averageTime" TEXT,
ADD COLUMN     "difficulty" INTEGER,
ADD COLUMN     "questionId" INTEGER,
ADD COLUMN     "score" TEXT,
ADD COLUMN     "type" TEXT;

-- AlterTable
ALTER TABLE "UserLeadActivity" ADD COLUMN     "interactionId" INTEGER;

-- AlterTable
ALTER TABLE "UserLeadInteraction" DROP COLUMN "leadId";

-- CreateTable
CREATE TABLE "QuizMeta" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "longDescription" TEXT,
    "shortDescription" TEXT,
    "logo" TEXT,

    CONSTRAINT "QuizMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizToPlatformNdCourse" (
    "id" SERIAL NOT NULL,
    "quizId" INTEGER NOT NULL,
    "courseId" INTEGER,
    "platformId" INTEGER NOT NULL,
    "interface" TEXT,
    "slug" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizToPlatformNdCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestionExplaination" (
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "attachment" JSONB
);

-- CreateTable
CREATE TABLE "QuizQuestionOption" (
    "id" SERIAL NOT NULL,
    "answer" TEXT NOT NULL,
    "attachment" JSONB,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "QuizQuestionOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizRightOption" (
    "optionId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "QuizOptionExplaination" (
    "optionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "attachment" JSONB
);

-- CreateTable
CREATE TABLE "QuizUserAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER,
    "quizId" INTEGER NOT NULL,
    "hasSubmitted" BOOLEAN,
    "platFormId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizUserAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "QuizQuestionAnswer" (
    "id" SERIAL NOT NULL,
    "quizAttemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,
    "optionId" INTEGER,
    "timeTaken" INTEGER,
    "hasSubmitted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "QuizQuestionAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "QuizMeta_quizId_key" ON "QuizMeta"("quizId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizQuestionExplaination_questionId_key" ON "QuizQuestionExplaination"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizRightOption_optionId_key" ON "QuizRightOption"("optionId");

-- CreateIndex
CREATE UNIQUE INDEX "QuizOptionExplaination_optionId_key" ON "QuizOptionExplaination"("optionId");

-- AddForeignKey
ALTER TABLE "QuizMeta" ADD CONSTRAINT "QuizMeta_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizToPlatformNdCourse" ADD CONSTRAINT "QuizToPlatformNdCourse_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizToPlatformNdCourse" ADD CONSTRAINT "QuizToPlatformNdCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizToPlatformNdCourse" ADD CONSTRAINT "QuizToPlatformNdCourse_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestion" ADD CONSTRAINT "QuizQuestion_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionExplaination" ADD CONSTRAINT "QuizQuestionExplaination_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionOption" ADD CONSTRAINT "QuizQuestionOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizRightOption" ADD CONSTRAINT "QuizRightOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuizQuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizOptionExplaination" ADD CONSTRAINT "QuizOptionExplaination_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuizQuestionOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizUserAttempt" ADD CONSTRAINT "QuizUserAttempt_quizId_fkey" FOREIGN KEY ("quizId") REFERENCES "Quiz"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizUserAttempt" ADD CONSTRAINT "QuizUserAttempt_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizUserAttempt" ADD CONSTRAINT "QuizUserAttempt_platFormId_fkey" FOREIGN KEY ("platFormId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionAnswer" ADD CONSTRAINT "QuizQuestionAnswer_quizAttemptId_fkey" FOREIGN KEY ("quizAttemptId") REFERENCES "QuizUserAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionAnswer" ADD CONSTRAINT "QuizQuestionAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "QuizQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "QuizQuestionAnswer" ADD CONSTRAINT "QuizQuestionAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "QuizQuestionOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadActivity" ADD CONSTRAINT "UserLeadActivity_interactionId_fkey" FOREIGN KEY ("interactionId") REFERENCES "UserLeadInteraction"("id") ON DELETE SET NULL ON UPDATE CASCADE;
