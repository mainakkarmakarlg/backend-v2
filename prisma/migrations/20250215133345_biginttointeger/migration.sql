/*
  Warnings:

  - You are about to alter the column `difficulty` on the `PracticeQuestion` table. The data in that column could be lost. The data in that column will be cast from `BigInt` to `Integer`.

*/
-- AlterTable
ALTER TABLE "PracticeOptionExplaination" ADD COLUMN     "attachment" JSONB;

-- AlterTable
ALTER TABLE "PracticeQuestion" ALTER COLUMN "difficulty" DROP NOT NULL,
ALTER COLUMN "difficulty" SET DATA TYPE INTEGER;
