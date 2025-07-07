/*
  Warnings:

  - You are about to drop the column `leadId` on the `UserContactForm` table. All the data in the column will be lost.

*/
-- DropForeignKey
ALTER TABLE "UserContactForm" DROP CONSTRAINT "UserContactForm_leadId_fkey";

-- AlterTable
ALTER TABLE "DoubtAnswer" ADD COLUMN     "isActive" BOOLEAN;

-- AlterTable
ALTER TABLE "DoubtQuestion" ADD COLUMN     "isActive" BOOLEAN;

-- AlterTable
ALTER TABLE "UserContactForm" DROP COLUMN "leadId";

-- CreateTable
CREATE TABLE "UserLeadActivity" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "userId" INTEGER,
    "cartId" INTEGER,
    "paymentId" INTEGER,
    "contactFormId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLeadActivity_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserLeadActivity" ADD CONSTRAINT "UserLeadActivity_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadActivity" ADD CONSTRAINT "UserLeadActivity_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "UserCart"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadActivity" ADD CONSTRAINT "UserLeadActivity_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "UserPayments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadActivity" ADD CONSTRAINT "UserLeadActivity_contactFormId_fkey" FOREIGN KEY ("contactFormId") REFERENCES "UserContactForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadActivity" ADD CONSTRAINT "UserLeadActivity_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "UserLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
