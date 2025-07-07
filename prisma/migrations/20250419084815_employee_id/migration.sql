/*
  Warnings:

  - You are about to drop the column `processing` on the `UserLead` table. All the data in the column will be lost.

*/
-- AlterTable
ALTER TABLE "UserLead" DROP COLUMN "processing",
ADD COLUMN     "employeeId" INTEGER;

-- AddForeignKey
ALTER TABLE "UserLead" ADD CONSTRAINT "UserLead_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
