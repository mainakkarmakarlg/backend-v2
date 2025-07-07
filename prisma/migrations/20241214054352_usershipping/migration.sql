/*
  Warnings:

  - Added the required column `userId` to the `UserBilling` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserBilling" ADD COLUMN     "userId" INTEGER NOT NULL;

-- CreateTable
CREATE TABLE "BillingCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "gstNo" TEXT,
    "address" TEXT,
    "billId" INTEGER,

    CONSTRAINT "BillingCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserShipping" (
    "id" SERIAL NOT NULL,
    "fname" TEXT,
    "lname" TEXT,
    "email" TEXT,
    "countryCode" TEXT,
    "phone" TEXT,
    "address" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "userId" INTEGER NOT NULL,

    CONSTRAINT "UserShipping_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserBilling" ADD CONSTRAINT "UserBilling_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "BillingCompany" ADD CONSTRAINT "BillingCompany_billId_fkey" FOREIGN KEY ("billId") REFERENCES "UserBilling"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserShipping" ADD CONSTRAINT "UserShipping_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
