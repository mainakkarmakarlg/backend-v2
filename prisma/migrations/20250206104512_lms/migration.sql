/*
  Warnings:

  - You are about to drop the column `courseId` on the `CourseSubject` table. All the data in the column will be lost.
  - You are about to drop the column `notInDoubtForum` on the `CourseSubject` table. All the data in the column will be lost.
  - You are about to drop the column `notInLectureGuide` on the `CourseSubject` table. All the data in the column will be lost.
  - You are about to drop the column `dob` on the `EmployeePersonal` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseSubject" DROP CONSTRAINT "CourseSubject_courseId_fkey";

-- AlterTable
ALTER TABLE "CourseSubject" DROP COLUMN "courseId",
DROP COLUMN "notInDoubtForum",
DROP COLUMN "notInLectureGuide",
ADD COLUMN     "type" TEXT,
ALTER COLUMN "order" DROP NOT NULL;

-- AlterTable
ALTER TABLE "EmployeePersonal" DROP COLUMN "dob",
ADD COLUMN     "Birth" TIMESTAMP(3);

-- CreateTable
CREATE TABLE "UserToCourse" (
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "UserToCourse_pkey" PRIMARY KEY ("userId","courseId")
);

-- CreateTable
CREATE TABLE "SolutionCombination" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "combination" TEXT NOT NULL,

    CONSTRAINT "SolutionCombination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSubjectToCourse" (
    "courseId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "CourseSubjectToCourse_pkey" PRIMARY KEY ("courseId","subjectId")
);

-- CreateTable
CREATE TABLE "FallNumber" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,

    CONSTRAINT "FallNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FallNumberToCourse" (
    "id" SERIAL NOT NULL,
    "fallId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "FallNumberToCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FallNumberToSubject" (
    "id" SERIAL NOT NULL,
    "fallId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "FallNumberToSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Quiz" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER,

    CONSTRAINT "Quiz_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPracticeAttempt" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserPracticeAttempt_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserPracticeAnswer" (
    "optionId" INTEGER,
    "attemptId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "UserPracticeAnswer_pkey" PRIMARY KEY ("attemptId","questionId")
);

-- CreateTable
CREATE TABLE "UserPracticeQuestionFlag" (
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "flagText" TEXT NOT NULL,

    CONSTRAINT "UserPracticeQuestionFlag_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateTable
CREATE TABLE "PracticeQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "averageTime" TEXT,
    "difficulty" BIGINT NOT NULL,
    "attachment" JSONB,

    CONSTRAINT "PracticeQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeOption" (
    "id" SERIAL NOT NULL,
    "answer" TEXT NOT NULL,
    "attachment" JSONB,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "PracticeOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PracticeRightOption" (
    "optionId" INTEGER NOT NULL
);

-- CreateTable
CREATE TABLE "ExcludeFromService" (
    "id" SERIAL NOT NULL,
    "excludedFrom" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "ExcludeFromService_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LectureInfo" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "remarks" TEXT NOT NULL,
    "contentCovered" TEXT NOT NULL,

    CONSTRAINT "LectureInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "VideoInfo" (
    "id" SERIAL NOT NULL,
    "videoCode" INTEGER,
    "duration" INTEGER,
    "videoUrl" TEXT,
    "hashCode" TEXT,
    "type" TEXT,

    CONSTRAINT "VideoInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToVideoInfo" (
    "userId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,
    "allocated" INTEGER,
    "seen" INTEGER,
    "done" BOOLEAN,

    CONSTRAINT "UserToVideoInfo_pkey" PRIMARY KEY ("userId","videoId")
);

-- CreateTable
CREATE TABLE "UserToVideoInfoFlag" (
    "userId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,
    "flagText" TEXT NOT NULL,

    CONSTRAINT "UserToVideoInfoFlag_pkey" PRIMARY KEY ("userId","videoId")
);

-- CreateTable
CREATE TABLE "UserToVideoInfoFeedback" (
    "userId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,
    "feedbackText" TEXT NOT NULL,
    "done" BOOLEAN,

    CONSTRAINT "UserToVideoInfoFeedback_pkey" PRIMARY KEY ("userId","videoId")
);

-- CreateTable
CREATE TABLE "LectureToVideo" (
    "id" SERIAL NOT NULL,
    "lectureId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,

    CONSTRAINT "LectureToVideo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Formula" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,

    CONSTRAINT "Formula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaToFallNumber" (
    "formulaId" INTEGER NOT NULL,
    "fallId" INTEGER NOT NULL,

    CONSTRAINT "FormulaToFallNumber_pkey" PRIMARY KEY ("formulaId","fallId")
);

-- CreateTable
CREATE TABLE "FormulaExplaination" (
    "id" SERIAL NOT NULL,
    "explainationText" TEXT NOT NULL,
    "footnote" TEXT NOT NULL,

    CONSTRAINT "FormulaExplaination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaExplainationToFormula" (
    "id" SERIAL NOT NULL,
    "explainationId" INTEGER NOT NULL,
    "formulaId" INTEGER NOT NULL,

    CONSTRAINT "FormulaExplainationToFormula_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FormulaExplainationToCourse" (
    "id" SERIAL NOT NULL,
    "explainationId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "FormulaExplainationToCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtQuestion" (
    "id" SERIAL NOT NULL,
    "questionText" TEXT NOT NULL,
    "attachments" JSONB,
    "userId" INTEGER,
    "employeeId" INTEGER,

    CONSTRAINT "DoubtQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtQuestionReport" (
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "DoubtQuestionReport_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateTable
CREATE TABLE "DoubtQuestionView" (
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "DoubtQuestionView_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateTable
CREATE TABLE "DoubtQuestionLike" (
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "DoubtQuestionLike_pkey" PRIMARY KEY ("userId","questionId")
);

-- CreateTable
CREATE TABLE "DoubtAnswer" (
    "id" SERIAL NOT NULL,
    "answerText" TEXT NOT NULL,
    "attachments" JSONB,
    "userId" INTEGER NOT NULL,
    "questionId" INTEGER NOT NULL,

    CONSTRAINT "DoubtAnswer_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtAnswerLike" (
    "answerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "DoubtAnswerLike_pkey" PRIMARY KEY ("answerId","userId")
);

-- CreateTable
CREATE TABLE "DoubtAnswerReport" (
    "answerId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "reason" TEXT NOT NULL,

    CONSTRAINT "DoubtAnswerReport_pkey" PRIMARY KEY ("answerId","userId")
);

-- CreateIndex
CREATE UNIQUE INDEX "PracticeRightOption_optionId_key" ON "PracticeRightOption"("optionId");

-- AddForeignKey
ALTER TABLE "UserToCourse" ADD CONSTRAINT "UserToCourse_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToCourse" ADD CONSTRAINT "UserToCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "SolutionCombination" ADD CONSTRAINT "SolutionCombination_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubjectToCourse" ADD CONSTRAINT "CourseSubjectToCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubjectToCourse" ADD CONSTRAINT "CourseSubjectToCourse_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CourseSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallNumberToCourse" ADD CONSTRAINT "FallNumberToCourse_fallId_fkey" FOREIGN KEY ("fallId") REFERENCES "FallNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallNumberToCourse" ADD CONSTRAINT "FallNumberToCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallNumberToSubject" ADD CONSTRAINT "FallNumberToSubject_fallId_fkey" FOREIGN KEY ("fallId") REFERENCES "FallNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallNumberToSubject" ADD CONSTRAINT "FallNumberToSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CourseSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeAttempt" ADD CONSTRAINT "UserPracticeAttempt_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeAnswer" ADD CONSTRAINT "UserPracticeAnswer_attemptId_fkey" FOREIGN KEY ("attemptId") REFERENCES "UserPracticeAttempt"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeAnswer" ADD CONSTRAINT "UserPracticeAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeAnswer" ADD CONSTRAINT "UserPracticeAnswer_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PracticeOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeQuestionFlag" ADD CONSTRAINT "UserPracticeQuestionFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPracticeQuestionFlag" ADD CONSTRAINT "UserPracticeQuestionFlag_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeOption" ADD CONSTRAINT "PracticeOption_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeRightOption" ADD CONSTRAINT "PracticeRightOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "PracticeOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExcludeFromService" ADD CONSTRAINT "ExcludeFromService_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CourseSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToVideoInfo" ADD CONSTRAINT "UserToVideoInfo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToVideoInfo" ADD CONSTRAINT "UserToVideoInfo_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToVideoInfoFlag" ADD CONSTRAINT "UserToVideoInfoFlag_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToVideoInfoFlag" ADD CONSTRAINT "UserToVideoInfoFlag_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToVideoInfoFeedback" ADD CONSTRAINT "UserToVideoInfoFeedback_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToVideoInfoFeedback" ADD CONSTRAINT "UserToVideoInfoFeedback_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureToVideo" ADD CONSTRAINT "LectureToVideo_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "LectureInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureToVideo" ADD CONSTRAINT "LectureToVideo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaToFallNumber" ADD CONSTRAINT "FormulaToFallNumber_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "Formula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaToFallNumber" ADD CONSTRAINT "FormulaToFallNumber_fallId_fkey" FOREIGN KEY ("fallId") REFERENCES "FallNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaExplainationToFormula" ADD CONSTRAINT "FormulaExplainationToFormula_explainationId_fkey" FOREIGN KEY ("explainationId") REFERENCES "FormulaExplaination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaExplainationToFormula" ADD CONSTRAINT "FormulaExplainationToFormula_formulaId_fkey" FOREIGN KEY ("formulaId") REFERENCES "Formula"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaExplainationToCourse" ADD CONSTRAINT "FormulaExplainationToCourse_explainationId_fkey" FOREIGN KEY ("explainationId") REFERENCES "FormulaExplaination"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FormulaExplainationToCourse" ADD CONSTRAINT "FormulaExplainationToCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestion" ADD CONSTRAINT "DoubtQuestion_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestion" ADD CONSTRAINT "DoubtQuestion_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestionReport" ADD CONSTRAINT "DoubtQuestionReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestionReport" ADD CONSTRAINT "DoubtQuestionReport_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DoubtQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestionView" ADD CONSTRAINT "DoubtQuestionView_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestionView" ADD CONSTRAINT "DoubtQuestionView_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DoubtQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestionLike" ADD CONSTRAINT "DoubtQuestionLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestionLike" ADD CONSTRAINT "DoubtQuestionLike_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DoubtQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtAnswer" ADD CONSTRAINT "DoubtAnswer_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DoubtQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtAnswer" ADD CONSTRAINT "DoubtAnswer_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtAnswerLike" ADD CONSTRAINT "DoubtAnswerLike_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "DoubtAnswer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtAnswerLike" ADD CONSTRAINT "DoubtAnswerLike_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtAnswerReport" ADD CONSTRAINT "DoubtAnswerReport_answerId_fkey" FOREIGN KEY ("answerId") REFERENCES "DoubtAnswer"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtAnswerReport" ADD CONSTRAINT "DoubtAnswerReport_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
