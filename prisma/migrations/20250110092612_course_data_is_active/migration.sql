-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "isActive" BOOLEAN;

-- AlterTable
ALTER TABLE "UserInvoice" ADD COLUMN     "shippingPincode" TEXT,
ALTER COLUMN "shippingAddress" DROP NOT NULL,
ALTER COLUMN "shippingCity" DROP NOT NULL,
ALTER COLUMN "shippingCountry" DROP NOT NULL,
ALTER COLUMN "shippingCountryCode" DROP NOT NULL,
ALTER COLUMN "shippingEmail" DROP NOT NULL,
ALTER COLUMN "shippingFname" DROP NOT NULL,
ALTER COLUMN "shippingLname" DROP NOT NULL,
ALTER COLUMN "shippingPhone" DROP NOT NULL,
ALTER COLUMN "shippingState" DROP NOT NULL;
