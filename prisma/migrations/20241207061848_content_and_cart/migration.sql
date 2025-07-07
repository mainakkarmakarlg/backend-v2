/*
  Warnings:

  - You are about to drop the `CourseDeliveryCharge` table. If the table is not empty, all the data it contains will be lost.
  - Added the required column `updatedAt` to the `UserCart` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserCart" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "quantity" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "courseId" DROP NOT NULL,
ALTER COLUMN "productId" DROP NOT NULL;

-- DropTable
DROP TABLE "CourseDeliveryCharge";

-- CreateTable
CREATE TABLE "PackageInfo" (
    "id" SERIAL NOT NULL,
    "height" INTEGER NOT NULL,
    "width" INTEGER NOT NULL,
    "depth" INTEGER NOT NULL,
    "weight" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "PackageInfo_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PackageDeliveryCharge" (
    "id" SERIAL NOT NULL,
    "continent" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "state" TEXT NOT NULL,
    "city" TEXT NOT NULL,
    "charge" TEXT NOT NULL,
    "courseId" INTEGER,
    "productId" INTEGER,

    CONSTRAINT "PackageDeliveryCharge_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Product" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "Product_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqContent" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "type" TEXT NOT NULL,
    "link" TEXT,
    "videoLink" TEXT,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "FaqContent_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserCart" ADD CONSTRAINT "UserCart_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCart" ADD CONSTRAINT "UserCart_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageDeliveryCharge" ADD CONSTRAINT "PackageDeliveryCharge_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageDeliveryCharge" ADD CONSTRAINT "PackageDeliveryCharge_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqContent" ADD CONSTRAINT "FaqContent_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "FaqSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
