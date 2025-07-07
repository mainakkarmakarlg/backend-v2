/*
  Warnings:

  - You are about to drop the `CourseCombination` table. If the table is not empty, all the data it contains will be lost.

*/
-- DropForeignKey
ALTER TABLE "CourseCombination" DROP CONSTRAINT "CourseCombination_courseId_fkey";

-- DropTable
DROP TABLE "CourseCombination";

-- CreateTable
CREATE TABLE "SolutionNumber" (
    "userId" INTEGER NOT NULL,
    "number" TEXT NOT NULL
);

-- CreateIndex
CREATE UNIQUE INDEX "SolutionNumber_userId_key" ON "SolutionNumber"("userId");

-- AddForeignKey
ALTER TABLE "SolutionNumber" ADD CONSTRAINT "SolutionNumber_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
