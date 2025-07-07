/*
  Warnings:

  - You are about to drop the column `city` on the `PackageDeliveryCharge` table. All the data in the column will be lost.
  - You are about to drop the column `continent` on the `PackageDeliveryCharge` table. All the data in the column will be lost.
  - You are about to drop the column `country` on the `PackageDeliveryCharge` table. All the data in the column will be lost.
  - You are about to drop the column `state` on the `PackageDeliveryCharge` table. All the data in the column will be lost.
  - Changed the type of `charge` on the `PackageDeliveryCharge` table. No cast exists, the column would be dropped and recreated, which cannot be done if there is data, since the column is required.
  - Added the required column `updatedAt` to the `UserBilling` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserShipping` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PackageDeliveryCharge" DROP COLUMN "city",
DROP COLUMN "continent",
DROP COLUMN "country",
DROP COLUMN "state",
ADD COLUMN     "cityId" INTEGER,
ADD COLUMN     "continentId" INTEGER,
ADD COLUMN     "countryId" INTEGER,
ADD COLUMN     "stateId" INTEGER,
DROP COLUMN "charge",
ADD COLUMN     "charge" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserBilling" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "UserShipping" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "UserMetaHistory" (
    "id" SERIAL NOT NULL,
    "field" TEXT NOT NULL,
    "valueText" TEXT,
    "valueJson" JSONB,
    "userId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserMetaHistory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "BannedLocation" (
    "id" SERIAL NOT NULL,
    "continentId" INTEGER,
    "countryId" INTEGER,
    "stateId" INTEGER,
    "cityId" INTEGER,
    "courseId" INTEGER,
    "productId" INTEGER,
    "reductionCharge" INTEGER,
    "message" TEXT,

    CONSTRAINT "BannedLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserMetaHistory" ADD CONSTRAINT "UserMetaHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserMetaHistory" ADD CONSTRAINT "UserMetaHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedLocation" ADD CONSTRAINT "BannedLocation_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BannedLocation" ADD CONSTRAINT "BannedLocation_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
