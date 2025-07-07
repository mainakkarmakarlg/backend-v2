-- CreateTable
CREATE TABLE "EmployeeEmail" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "isActive" BOOLEAN,

    CONSTRAINT "EmployeeEmail_pkey" PRIMARY KEY ("id")
);
