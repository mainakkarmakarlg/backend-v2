-- CreateTable
CREATE TABLE "EmployeeToEmployee" (
    "upperEmployeeId" INTEGER NOT NULL,
    "lowerEmployeeId" INTEGER NOT NULL,
    "order" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeToEmployee_pkey" PRIMARY KEY ("upperEmployeeId","lowerEmployeeId")
);

-- AddForeignKey
ALTER TABLE "EmployeeToEmployee" ADD CONSTRAINT "EmployeeToEmployee_upperEmployeeId_fkey" FOREIGN KEY ("upperEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeToEmployee" ADD CONSTRAINT "EmployeeToEmployee_lowerEmployeeId_fkey" FOREIGN KEY ("lowerEmployeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
