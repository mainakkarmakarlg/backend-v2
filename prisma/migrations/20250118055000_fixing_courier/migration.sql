/*
  Warnings:

  - You are about to drop the column `depth` on the `PackageInfo` table. All the data in the column will be lost.
  - Added the required column `length` to the `PackageInfo` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "PackageInfo" DROP COLUMN "depth",
ADD COLUMN     "length" INTEGER NOT NULL;
