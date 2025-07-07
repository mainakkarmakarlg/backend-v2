/*
  Warnings:

  - The `longDescription` column on the `CourseMeta` table would be dropped and recreated. This will lead to data loss if there is data in the column.

*/
-- AlterTable
ALTER TABLE "CourseMeta" DROP COLUMN "longDescription",
ADD COLUMN     "longDescription" JSONB;
