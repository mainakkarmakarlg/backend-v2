/*
  Warnings:

  - Added the required column `updatedAt` to the `UserInvoice` table without a default value. This is not possible if the table is not empty.

*/
-- AlterTable
ALTER TABLE "UserInvoice" ADD COLUMN     "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
ADD COLUMN     "updatedAt" TIMESTAMP(3) NOT NULL;

-- CreateTable
CREATE TABLE "EmployeePersonal" (
    "id" SERIAL NOT NULL,
    "email" TEXT,
    "phone" TEXT,
    "countryCode" TEXT,
    "dob" TIMESTAMP(3),
    "maritalStatus" TEXT,
    "whatsapp" TEXT,
    "whatsappCountryCode" TEXT,
    "qualification" TEXT,
    "city" TEXT,
    "state" TEXT,
    "country" TEXT,
    "pincode" TEXT,
    "bankAccount" TEXT,
    "bankHolderName" TEXT,
    "bankIFSCCode" TEXT,
    "bankName" TEXT,
    "bankBranch" TEXT,
    "join" TIMESTAMP(3),
    "end" TIMESTAMP(3),
    "education" JSONB,
    "government" JSONB,
    "employeeId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeePersonal_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeWork" (
    "id" SERIAL NOT NULL,
    "team" TEXT,

    CONSTRAINT "EmployeeWork_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeePersonal" ADD CONSTRAINT "EmployeePersonal_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
