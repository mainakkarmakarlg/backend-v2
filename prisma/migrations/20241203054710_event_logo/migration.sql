/*
  Warnings:

  - Added the required column `metaName` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `metaValue` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseMeta" ADD COLUMN     "metaName" TEXT NOT NULL,
ADD COLUMN     "metaValue" JSONB NOT NULL;

-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "eventLogo" TEXT;

-- CreateTable
CREATE TABLE "CourseDeliveryCharge" (
    "id" SERIAL NOT NULL,
    "continent" TEXT NOT NULL,
    "country" TEXT NOT NULL,

    CONSTRAINT "CourseDeliveryCharge_pkey" PRIMARY KEY ("id")
);
