/*
  Warnings:

  - You are about to drop the column `attending` on the `EventToUser` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "EventToGallery" ADD COLUMN     "featured" BOOLEAN;

-- AlterTable
ALTER TABLE "EventToUser" DROP COLUMN "attending";

-- AlterTable
ALTER TABLE "FaqContent" ADD COLUMN     "thumbnail" TEXT;
