-- AlterTable
ALTER TABLE "UserCart" ADD COLUMN     "paymentId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserCart" ADD CONSTRAINT "UserCart_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "UserPayments"("id") ON DELETE SET NULL ON UPDATE CASCADE;
