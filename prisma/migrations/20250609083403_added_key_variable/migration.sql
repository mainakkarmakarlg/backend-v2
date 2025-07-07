/*
  Warnings:

  - Added the required column `key` to the `QuizMetaOption` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "QuizMetaOption" ADD COLUMN     "key" TEXT NOT NULL;
