/*
  Warnings:

  - You are about to drop the column `metaName` on the `CourseMeta` table. All the data in the column will be lost.
  - You are about to drop the column `metaValue` on the `CourseMeta` table. All the data in the column will be lost.
  - Added the required column `charge` to the `CourseDeliveryCharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `city` to the `CourseDeliveryCharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `state` to the `CourseDeliveryCharge` table without a default value. This is not possible if the table is not empty.
  - Added the required column `courseLogo` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `longDescription` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shortDescription` to the `CourseMeta` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "CourseDeliveryCharge" ADD COLUMN     "charge" TEXT NOT NULL,
ADD COLUMN     "city" TEXT NOT NULL,
ADD COLUMN     "state" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "CourseMeta" DROP COLUMN "metaName",
DROP COLUMN "metaValue",
ADD COLUMN     "courseLogo" TEXT NOT NULL,
ADD COLUMN     "longDescription" TEXT NOT NULL,
ADD COLUMN     "shortDescription" TEXT NOT NULL;

-- AlterTable
ALTER TABLE "FaqQuestion" ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "FaqSubject" ADD COLUMN     "order" INTEGER;

-- CreateTable
CREATE TABLE "Employee" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Employee_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeDevices" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "deviceId" TEXT NOT NULL,
    "type" TEXT NOT NULL,

    CONSTRAINT "EmployeeDevices_pkey" PRIMARY KEY ("id")
);
