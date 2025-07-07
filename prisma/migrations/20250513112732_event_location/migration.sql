/*
  Warnings:

  - You are about to drop the column `addressLink` on the `EventsMeta` table. All the data in the column will be lost.
  - You are about to drop the column `eventLogo` on the `EventsMeta` table. All the data in the column will be lost.
  - You are about to drop the column `registrationEndDate` on the `EventsMeta` table. All the data in the column will be lost.
  - You are about to drop the column `registrationStartDate` on the `EventsMeta` table. All the data in the column will be lost.
  - Added the required column `updatedAt` to the `VideoInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventsMeta" DROP COLUMN "addressLink",
DROP COLUMN "eventLogo",
DROP COLUMN "registrationEndDate",
DROP COLUMN "registrationStartDate",
ADD COLUMN     "endDate" TIMESTAMP(3),
ADD COLUMN     "startDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "VideoInfo" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL,
ALTER COLUMN "videoCode" SET DATA TYPE TEXT;

-- CreateTable
CREATE TABLE "EventLocation" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "mode" TEXT,
    "addressLink" TEXT,
    "eventId" INTEGER NOT NULL,

    CONSTRAINT "EventLocation_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventLocation" ADD CONSTRAINT "EventLocation_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
