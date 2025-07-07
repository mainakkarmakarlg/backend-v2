/*
  Warnings:

  - Added the required column `name` to the `Product` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Product" ADD COLUMN     "abbr" TEXT,
ADD COLUMN     "name" TEXT NOT NULL;

-- CreateTable
CREATE TABLE "UserCourier" (
    "id" SERIAL NOT NULL,
    "trackingId" TEXT NOT NULL,
    "status" TEXT,
    "userId" INTEGER,
    "shippingCompanyId" INTEGER NOT NULL,
    "paymentId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserCourier_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ShippingCompany" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "code" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "ShippingCompany_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Company" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "gst" TEXT,
    "address" TEXT,
    "state" TEXT,
    "city" TEXT,
    "country" TEXT,

    CONSTRAINT "Company_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductMeta" (
    "id" SERIAL NOT NULL,
    "productLogo" TEXT,
    "longDescription" TEXT,
    "shortDescription" TEXT,
    "productId" INTEGER NOT NULL,
    "price" DECIMAL(65,30),
    "purchasable" BOOLEAN,

    CONSTRAINT "ProductMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "ProductOption" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB,
    "productId" INTEGER NOT NULL,
    "type" TEXT,
    "valueText" TEXT,

    CONSTRAINT "ProductOption_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PlatformToProduct" (
    "platformId" INTEGER NOT NULL,
    "productId" INTEGER NOT NULL,

    CONSTRAINT "PlatformToProduct_pkey" PRIMARY KEY ("platformId","productId")
);

-- AddForeignKey
ALTER TABLE "UserCourier" ADD CONSTRAINT "UserCourier_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourier" ADD CONSTRAINT "UserCourier_shippingCompanyId_fkey" FOREIGN KEY ("shippingCompanyId") REFERENCES "ShippingCompany"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserCourier" ADD CONSTRAINT "UserCourier_paymentId_fkey" FOREIGN KEY ("paymentId") REFERENCES "UserPayments"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPayments" ADD CONSTRAINT "UserPayments_userFrom_fkey" FOREIGN KEY ("userFrom") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductMeta" ADD CONSTRAINT "ProductMeta_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ProductOption" ADD CONSTRAINT "ProductOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformToProduct" ADD CONSTRAINT "PlatformToProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformToProduct" ADD CONSTRAINT "PlatformToProduct_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
