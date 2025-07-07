-- CreateTable
CREATE TABLE "EmployeeNumber" (
    "id" SERIAL NOT NULL,
    "number" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeNumber_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeToNumber" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "numberId" INTEGER NOT NULL,
    "startTime" TIMESTAMP(3),
    "endTime" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "EmployeeToNumber_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeToNumber" ADD CONSTRAINT "EmployeeToNumber_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeToNumber" ADD CONSTRAINT "EmployeeToNumber_numberId_fkey" FOREIGN KEY ("numberId") REFERENCES "EmployeeNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
