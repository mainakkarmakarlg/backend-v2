/*
  Warnings:

  - You are about to drop the column `testimonial` on the `UserTestimonialCategoryToTestimonial` table. All the data in the column will be lost.
  - Added the required column `testimonialId` to the `UserTestimonialCategoryToTestimonial` table without a default value. This is not possible if the table is not empty.

*/
-- DropForeignKey
ALTER TABLE "UserTestimonialCategoryToTestimonial" DROP CONSTRAINT "UserTestimonialCategoryToTestimonial_testimonial_fkey";

-- AlterTable
ALTER TABLE "UserTestimonialCategoryToTestimonial" DROP COLUMN "testimonial",
ADD COLUMN     "testimonialId" INTEGER NOT NULL;

-- AddForeignKey
ALTER TABLE "UserTestimonialCategoryToTestimonial" ADD CONSTRAINT "UserTestimonialCategoryToTestimonial_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "UserTestimonials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
