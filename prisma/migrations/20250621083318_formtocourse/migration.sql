/*
  Warnings:

  - You are about to drop the column `courseId` on the `UserForm` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserForm" DROP CONSTRAINT "UserForm_courseId_fkey";

-- AlterTable
ALTER TABLE "UserForm" DROP COLUMN "courseId";

-- CreateTable
CREATE TABLE "UserFormToCourse" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "formId" INTEGER NOT NULL,

    CONSTRAINT "UserFormToCourse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserFormToCourse" ADD CONSTRAINT "UserFormToCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFormToCourse" ADD CONSTRAINT "UserFormToCourse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "UserForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
