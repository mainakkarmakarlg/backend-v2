-- CreateTable
CREATE TABLE "PracticeQuestionReport" (
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT,
    "tag" JSONB,

    CONSTRAINT "PracticeQuestionReport_pkey" PRIMARY KEY ("userId","questionId")
);

-- AddForeignKey
ALTER TABLE "PracticeQuestionReport" ADD CONSTRAINT "PracticeQuestionReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeQuestionReport" ADD CONSTRAINT "PracticeQuestionReport_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
