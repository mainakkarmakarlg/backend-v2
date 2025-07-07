/*
  Warnings:

  - You are about to drop the column `call` on the `UserLead` table. All the data in the column will be lost.
  - You are about to drop the column `platform` on the `UserLead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserLead" DROP COLUMN "call",
DROP COLUMN "platform",
ADD COLUMN     "action" TEXT,
ADD COLUMN     "countryCode" TEXT,
ADD COLUMN     "platformId" INTEGER,
ALTER COLUMN "fname" DROP NOT NULL,
ALTER COLUMN "lname" DROP NOT NULL,
ALTER COLUMN "email" DROP NOT NULL,
ALTER COLUMN "phone" DROP NOT NULL,
ALTER COLUMN "priority" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "UserCart" ADD CONSTRAINT "UserCart_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLead" ADD CONSTRAINT "UserLead_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;
