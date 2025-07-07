/*
  Warnings:

  - Added the required column `updatedAt` to the `DoubtQuestion` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "DoubtQuestion" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "fallNumber" INTEGER,
ADD COLUMN     "sourceId" INTEGER,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "DoubtForumSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "DoubtForumSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "DoubtForumPin" (
    "questionId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "DoubtForumPin_pkey" PRIMARY KEY ("questionId","userId")
);

-- AddForeignKey
ALTER TABLE "DoubtQuestion" ADD CONSTRAINT "DoubtQuestion_fallNumber_fkey" FOREIGN KEY ("fallNumber") REFERENCES "FallNumber"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtQuestion" ADD CONSTRAINT "DoubtQuestion_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "DoubtForumSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtForumPin" ADD CONSTRAINT "DoubtForumPin_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "DoubtForumPin" ADD CONSTRAINT "DoubtForumPin_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "DoubtQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
