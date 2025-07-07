/*
  Warnings:

  - You are about to drop the column `gatewayOrderId` on the `UserInvoice` table. All the data in the column will be lost.
  - Added the required column `paymentId` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `transactionId` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserInvoice" DROP COLUMN "gatewayOrderId",
ADD COLUMN     "paymentId" INTEGER NOT NULL,
ADD COLUMN     "transactionId" TEXT NOT NULL;

-- AddForeignKey
ALTER TABLE "UserInvoice" ADD CONSTRAINT "UserInvoice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvoice" ADD CONSTRAINT "UserInvoice_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "UserPayments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserInvoice" ADD CONSTRAINT "UserInvoice_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "PaymentGatways"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
