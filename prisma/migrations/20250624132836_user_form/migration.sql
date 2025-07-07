-- AlterTable
ALTER TABLE "UserForm" ADD COLUMN     "failFormId" INTEGER,
ADD COLUMN     "failJson" JSONB,
ADD COLUMN     "successFormId" INTEGER,
ADD COLUMN     "successJson" JSONB;
