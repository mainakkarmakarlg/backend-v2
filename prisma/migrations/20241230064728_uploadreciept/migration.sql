/*
  Warnings:

  - You are about to drop the column `paymentId` on the `UserInvoice` table. All the data in the column will be lost.
  - Added the required column `billingAddress` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingCity` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingCountry` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingCountryCode` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingEmail` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingFname` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingLname` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingPhone` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingPincode` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `billingState` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyGST` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `companyName` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `countryCode` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `email` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fname` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gatewayId` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `gatewayOrderId` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lname` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `orderId` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `paymentType` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `phone` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `priceJson` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `products` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingAddress` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCity` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCountry` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingCountryCode` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingEmail` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingFname` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingLname` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingPhone` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `shippingState` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `templateId` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.
  - Added the required column `userId` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserInvoice" DROP COLUMN "paymentId",
ADD COLUMN     "billingAddress" TEXT NOT NULL,
ADD COLUMN     "billingCity" TEXT NOT NULL,
ADD COLUMN     "billingCountry" TEXT NOT NULL,
ADD COLUMN     "billingCountryCode" TEXT NOT NULL,
ADD COLUMN     "billingEmail" TEXT NOT NULL,
ADD COLUMN     "billingFname" TEXT NOT NULL,
ADD COLUMN     "billingLname" TEXT NOT NULL,
ADD COLUMN     "billingPhone" TEXT NOT NULL,
ADD COLUMN     "billingPincode" TEXT NOT NULL,
ADD COLUMN     "billingState" TEXT NOT NULL,
ADD COLUMN     "companyGST" TEXT NOT NULL,
ADD COLUMN     "companyName" TEXT NOT NULL,
ADD COLUMN     "countryCode" TEXT NOT NULL,
ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fname" TEXT NOT NULL,
ADD COLUMN     "gatewayId" INTEGER NOT NULL,
ADD COLUMN     "gatewayOrderId" INTEGER NOT NULL,
ADD COLUMN     "lname" TEXT NOT NULL,
ADD COLUMN     "orderId" TEXT NOT NULL,
ADD COLUMN     "paymentType" TEXT NOT NULL,
ADD COLUMN     "phone" TEXT NOT NULL,
ADD COLUMN     "priceJson" JSONB NOT NULL,
ADD COLUMN     "products" JSONB NOT NULL,
ADD COLUMN     "shippingAddress" TEXT NOT NULL,
ADD COLUMN     "shippingCity" TEXT NOT NULL,
ADD COLUMN     "shippingCountry" TEXT NOT NULL,
ADD COLUMN     "shippingCountryCode" TEXT NOT NULL,
ADD COLUMN     "shippingEmail" TEXT NOT NULL,
ADD COLUMN     "shippingFname" TEXT NOT NULL,
ADD COLUMN     "shippingLname" TEXT NOT NULL,
ADD COLUMN     "shippingPhone" TEXT NOT NULL,
ADD COLUMN     "shippingState" TEXT NOT NULL,
ADD COLUMN     "templateId" INTEGER NOT NULL,
ADD COLUMN     "userId" INTEGER NOT NULL;

-- AlterTable
ALTER TABLE "UserPayments" ADD COLUMN     "reciept" JSONB,
ALTER COLUMN "gatewayOrderId" DROP NOT NULL;

-- CreateTable
CREATE TABLE "UserContactForm" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "appointmentTime" TIMESTAMP(3),
    "message" TEXT,
    "courseId" INTEGER,
    "productId" INTEGER,
    "userId" INTEGER,
    "eneteredText" TEXT,
    "email" TEXT,
    "phone" TEXT,
    "counrtyCode" TEXT,
    "platformId" INTEGER,

    CONSTRAINT "UserContactForm_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserContactForm" ADD CONSTRAINT "UserContactForm_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContactForm" ADD CONSTRAINT "UserContactForm_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContactForm" ADD CONSTRAINT "UserContactForm_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContactForm" ADD CONSTRAINT "UserContactForm_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
