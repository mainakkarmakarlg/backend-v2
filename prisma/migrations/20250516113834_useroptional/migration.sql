-- DropForeignKey
ALTER TABLE "EventToUser" DROP CONSTRAINT "EventToUser_userId_fkey";

-- AlterTable
ALTER TABLE "EventToUser" ALTER COLUMN "userId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "EventToUser" ADD CONSTRAINT "EventToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
