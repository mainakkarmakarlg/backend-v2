/*
  Warnings:

  - You are about to drop the column `apiKey` on the `PaymentGatways` table. All the data in the column will be lost.
  - You are about to drop the column `apiSecret` on the `PaymentGatways` table. All the data in the column will be lost.
  - Added the required column `isActive` to the `PaymentGatways` table without a default value. This is not possible if the table is not empty.
  - Added the required column `prefix` to the `PaymentGatways` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PaymentGatways" DROP COLUMN "apiKey",
DROP COLUMN "apiSecret",
ADD COLUMN     "isActive" BOOLEAN NOT NULL,
ADD COLUMN     "prefix" TEXT NOT NULL;
