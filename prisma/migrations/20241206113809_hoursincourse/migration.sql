/*
  Warnings:

  - Added the required column `hours` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseMeta" ADD COLUMN     "hours" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "UserCart" (
    "id" SERIAL NOT NULL,
    "courseId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "isComplete" BOOLEAN NOT NULL,
    "status" TEXT NOT NULL,

    CONSTRAINT "UserCart_pkey" PRIMARY KEY ("id")
);
