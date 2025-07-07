/*
  Warnings:

  - Added the required column `employeeId` to the `EmployeeWork` table without a default value. This is not possible if the table is not empty.
  - Added the required column `updatedAt` to the `EmployeeWork` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "EmployeeWork" ADD COLUMN     "company" TEXT,
ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "designation" TEXT,
ADD COLUMN     "employeeId" INTEGER NOT NULL,
ADD COLUMN     "numberForOTP" TEXT,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "OldEmployeeDetail" (
    "id" SERIAL NOT NULL,
    "oldField" TEXT NOT NULL,
    "oldValue" TEXT NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "OldEmployeeDetail_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeWork" ADD CONSTRAINT "EmployeeWork_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "OldEmployeeDetail" ADD CONSTRAINT "OldEmployeeDetail_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
