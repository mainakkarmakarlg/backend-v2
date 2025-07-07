/*
  Warnings:

  - You are about to drop the `CourseSubjects` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseSubjects" DROP CONSTRAINT "CourseSubjects_courseId_fkey";

-- DropForeignKey
ALTER TABLE "CourseSubjects" DROP CONSTRAINT "CourseSubjects_subjectId_fkey";

-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "isActive" BOOLEAN;

-- DropTable
DROP TABLE "CourseSubjects";

-- CreateTable
CREATE TABLE "CourseCombination" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "combinationId" TEXT NOT NULL,

    CONSTRAINT "CourseCombination_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "CourseSubject" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "subjectId" INTEGER,
    "courseId" INTEGER,
    "notInDoubtForum" BOOLEAN,
    "notInLectureGuide" BOOLEAN,

    CONSTRAINT "CourseSubject_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseCombination" ADD CONSTRAINT "CourseCombination_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubject" ADD CONSTRAINT "CourseSubject_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubject" ADD CONSTRAINT "CourseSubject_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CourseSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;
