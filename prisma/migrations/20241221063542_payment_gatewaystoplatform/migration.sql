/*
  Warnings:

  - You are about to drop the column `isActive` on the `PaymentGatways` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "PaymentGatways" DROP COLUMN "isActive";

-- CreateTable
CREATE TABLE "PaymentGatwaysToPlatform" (
    "id" SERIAL NOT NULL,
    "gatewayId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,
    "isActive" BOOLEAN NOT NULL,

    CONSTRAINT "PaymentGatwaysToPlatform_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PaymentGatwaysToPlatform" ADD CONSTRAINT "PaymentGatwaysToPlatform_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "PaymentGatways"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PaymentGatwaysToPlatform" ADD CONSTRAINT "PaymentGatwaysToPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
