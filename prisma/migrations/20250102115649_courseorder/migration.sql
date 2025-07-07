/*
  Warnings:

  - You are about to drop the column `courseId` on the `UserContactForm` table. All the data in the column will be lost.
  - You are about to drop the column `name` on the `UserContactForm` table. All the data in the column will be lost.
  - You are about to drop the column `productId` on the `UserContactForm` table. All the data in the column will be lost.
  - The `eneteredText` column on the `UserContactForm` table would be dropped and recreated. This will lead to data loss if there is data in the column.
  - Added the required column `fname` to the `UserContactForm` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lname` to the `UserContactForm` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserContactForm" DROP CONSTRAINT "UserContactForm_courseId_fkey";

-- DropForeignKey
ALTER TABLE "UserContactForm" DROP CONSTRAINT "UserContactForm_productId_fkey";

-- AlterTable
ALTER TABLE "Course" ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "UserContactForm" DROP COLUMN "courseId",
DROP COLUMN "name",
DROP COLUMN "productId",
ADD COLUMN     "fname" TEXT NOT NULL,
ADD COLUMN     "lname" TEXT NOT NULL,
DROP COLUMN "eneteredText",
ADD COLUMN     "eneteredText" JSONB;

-- CreateTable
CREATE TABLE "UserContactFormToProductNdCourse" (
    "id" SERIAL NOT NULL,
    "formId" INTEGER NOT NULL,
    "productId" INTEGER,
    "courseId" INTEGER,

    CONSTRAINT "UserContactFormToProductNdCourse_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserContactFormToProductNdCourse" ADD CONSTRAINT "UserContactFormToProductNdCourse_formId_fkey" FOREIGN KEY ("formId") REFERENCES "UserContactForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContactFormToProductNdCourse" ADD CONSTRAINT "UserContactFormToProductNdCourse_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContactFormToProductNdCourse" ADD CONSTRAINT "UserContactFormToProductNdCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
