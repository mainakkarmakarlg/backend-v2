/*
  Warnings:

  - Added the required column `courseId` to the `UserPracticeAttempt` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPracticeAttempt" ADD COLUMN     "courseId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserPracticeAttempt" ADD CONSTRAINT "UserPracticeAttempt_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
