-- AlterTable
ALTER TABLE "CourseMeta" ALTER COLUMN "courseLogo" DROP NOT NULL,
ALTER COLUMN "longDescription" DROP NOT NULL,
ALTER COLUMN "shortDescription" DROP NOT NULL,
ALTER COLUMN "price" DROP NOT NULL,
ALTER COLUMN "purchasable" DROP NOT NULL,
ALTER COLUMN "hours" DROP NOT NULL;

-- CreateTable
CREATE TABLE "ExtraOptionsToCart" (
    "id" SERIAL NOT NULL,
    "cartId" INTEGER NOT NULL,
    "extraOptionId" INTEGER NOT NULL,

    CONSTRAINT "ExtraOptionsToCart_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExtraOptionsToCart" ADD CONSTRAINT "ExtraOptionsToCart_cartId_fkey" FOREIGN KEY ("cartId") REFERENCES "UserCart"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraOptionsToCart" ADD CONSTRAINT "ExtraOptionsToCart_extraOptionId_fkey" FOREIGN KEY ("extraOptionId") REFERENCES "ExtraOption"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
