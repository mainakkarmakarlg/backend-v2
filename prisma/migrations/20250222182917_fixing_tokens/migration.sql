/*
  Warnings:

  - The primary key for the `UserPracticeQuestionFlag` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - The primary key for the `UserRefreshToken` table will be changed. If it partially fails, the table could be left without primary key constraint.
  - You are about to drop the column `id` on the `UserRefreshToken` table. All the data in the column will be lost.
  - A unique constraint covering the columns `[token]` on the table `UserRefreshToken` will be added. If there are existing duplicate values, this will fail.

*/
-- AlterTable
ALTER TABLE "UserPracticeQuestionFlag" DROP CONSTRAINT "UserPracticeQuestionFlag_pkey",
ADD COLUMN     "id" SERIAL NOT NULL,
ADD CONSTRAINT "UserPracticeQuestionFlag_pkey" PRIMARY KEY ("id");

-- AlterTable
ALTER TABLE "UserRefreshToken" DROP CONSTRAINT "UserRefreshToken_pkey",
DROP COLUMN "id";

-- CreateIndex
CREATE UNIQUE INDEX "UserRefreshToken_token_key" ON "UserRefreshToken"("token");
