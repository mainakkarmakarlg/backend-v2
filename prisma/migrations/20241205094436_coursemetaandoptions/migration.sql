/*
  Warnings:

  - Added the required column `courseId` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `price` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `purchasable` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseMeta" ADD COLUMN     "courseId" INTEGER NOT NULL,
ADD COLUMN     "price" DECIMAL(65,30) NOT NULL,
ADD COLUMN     "purchasable" BOOLEAN NOT NULL;

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "link" TEXT;

-- CreateTable
CREATE TABLE "CourseOption" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB,
    "courseId" INTEGER NOT NULL,
    "type" TEXT,
    "valueText" TEXT,

    CONSTRAINT "CourseOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseMeta" ADD CONSTRAINT "CourseMeta_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseOption" ADD CONSTRAINT "CourseOption_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
