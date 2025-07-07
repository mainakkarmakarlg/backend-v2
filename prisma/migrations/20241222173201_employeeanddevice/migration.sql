/*
  Warnings:

  - Added the required column `email` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `fname` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `lname` to the `Employee` table without a default value. This is not possible if the table is not empty.
  - Added the required column `password` to the `Employee` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "Employee" ADD COLUMN     "email" TEXT NOT NULL,
ADD COLUMN     "fname" TEXT NOT NULL,
ADD COLUMN     "lname" TEXT NOT NULL,
ADD COLUMN     "password" TEXT NOT NULL,
ADD COLUMN     "profile" TEXT;

-- CreateTable
CREATE TABLE "EmployeeToDevice" (
    "employeeId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAllowed" BOOLEAN,

    CONSTRAINT "EmployeeToDevice_pkey" PRIMARY KEY ("employeeId","deviceId")
);

-- AddForeignKey
ALTER TABLE "EmployeeToDevice" ADD CONSTRAINT "EmployeeToDevice_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeToDevice" ADD CONSTRAINT "EmployeeToDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "EmployeeDevices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
