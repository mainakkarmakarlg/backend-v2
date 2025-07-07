-- CreateTable
CREATE TABLE "PracticeQuestionExplaination" (
    "questionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL,
    "attachment" JSONB
);

-- CreateTable
CREATE TABLE "PracticeOptionExplaination" (
    "optionId" INTEGER NOT NULL,
    "text" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeQuestionExplaination_questionId_key" ON "PracticeQuestionExplaination"("questionId");

-- CreateIndex
CREATE UNIQUE INDEX "PracticeOptionExplaination_optionId_key" ON "PracticeOptionExplaination"("optionId");

-- AddForeignKey
ALTER TABLE "PracticeQuestionExplaination" ADD CONSTRAINT "PracticeQuestionExplaination_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeOptionExplaination" ADD CONSTRAINT "PracticeOptionExplaination_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PracticeOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
