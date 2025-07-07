-- AlterTable
ALTER TABLE "UserRefreshToken" ADD COLUMN     "isOnline" BOOLEAN,
ADD COLUMN     "updatedAt" TIMESTAMP(3);
