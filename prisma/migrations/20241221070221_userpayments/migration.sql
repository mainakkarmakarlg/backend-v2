/*
  Warnings:

  - Added the required column `platformId` to the `UserPayments` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `UserPayments` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserPayments" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "platformId" INTEGER NOT NULL,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- AddForeignKey
ALTER TABLE "UserPayments" ADD CONSTRAINT "UserPayments_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
