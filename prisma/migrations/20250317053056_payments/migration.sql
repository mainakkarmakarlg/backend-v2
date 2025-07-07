/*
  Warnings:

  - You are about to drop the column `userFrom` on the `UserPayments` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserPayments" DROP CONSTRAINT "UserPayments_userFrom_fkey";

-- AlterTable
ALTER TABLE "UserPayments" DROP COLUMN "userFrom",
ADD COLUMN     "someElse" BOOLEAN,
ADD COLUMN     "userFor" INTEGER;

-- CreateTable
CREATE TABLE "UserPaymentDetail" (
    "id" SERIAL NOT NULL,
    "payment" TEXT,
    "method" TEXT,
    "fee" INTEGER,
    "tax" INTEGER,
    "paymentId" INTEGER NOT NULL,

    CONSTRAINT "UserPaymentDetail_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentSettlement" (
    "id" SERIAL NOT NULL,
    "amount" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "fees" INTEGER NOT NULL,
    "tax" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "PaymentSettlement_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserPayments" ADD CONSTRAINT "UserPayments_userFor_fkey" FOREIGN KEY ("userFor") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPaymentDetail" ADD CONSTRAINT "UserPaymentDetail_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "UserPayments"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
