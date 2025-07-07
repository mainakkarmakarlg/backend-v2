-- AlterTable
ALTER TABLE "ExtraOption" ADD COLUMN     "price" DECIMAL(65,30);

-- CreateTable
CREATE TABLE "UserBilling" (
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

    CONSTRAINT "UserBilling_pkey" PRIMARY KEY ("id")
);
