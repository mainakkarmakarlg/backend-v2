/*
  Warnings:

  - Added the required column `updatedAt` to the `DoubtAnswer` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DoubtAnswerLike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DoubtAnswerReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DoubtQuestionLike` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DoubtQuestionReport` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `DoubtQuestionView` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoubtAnswer" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DoubtAnswerLike" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "liked" BOOLEAN,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DoubtAnswerReport" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "tags" JSONB,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DoubtForumSource" ADD COLUMN     "courseId" INTEGER;

-- AlterTable
ALTER TABLE "DoubtQuestionLike" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "liked" BOOLEAN,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DoubtQuestionReport" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "DoubtQuestionView" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "DoubtForumSource" ADD CONSTRAINT "DoubtForumSource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
