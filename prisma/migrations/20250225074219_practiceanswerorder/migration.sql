-- AlterTable
ALTER TABLE "UserPracticeAnswer" ADD COLUMN     "order" INTEGER;

-- AlterTable
ALTER TABLE "UserPracticeQuestionFlag" ALTER COLUMN "flagText" DROP NOT NULL;
