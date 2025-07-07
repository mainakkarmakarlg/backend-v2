/*
  Warnings:

  - Added the required column `updatedAt` to the `EventLocation` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EventLocation" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AlterTable
ALTER TABLE "EventToUser" ADD COLUMN     "locationId" INTEGER;

-- AddForeignKey
ALTER TABLE "EventToUser" ADD CONSTRAINT "EventToUser_locationId_fkey" FOREIGN KEY ("locationId") REFERENCES "EventLocation"("id") ON DELETE SET NULL ON UPDATE CASCADE;
