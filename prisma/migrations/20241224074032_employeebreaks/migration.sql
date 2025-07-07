-- CreateTable
CREATE TABLE "EmployeeAttandenceBreak" (
    "id" SERIAL NOT NULL,
    "attandenceId" INTEGER NOT NULL,
    "breakStart" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "breakEnd" TIMESTAMP(3) NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAttandenceBreak_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeAttandenceBreak" ADD CONSTRAINT "EmployeeAttandenceBreak_attandenceId_fkey" FOREIGN KEY ("attandenceId") REFERENCES "EmployeeAttandence"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
