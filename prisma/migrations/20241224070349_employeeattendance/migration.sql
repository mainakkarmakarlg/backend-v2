-- CreateTable
CREATE TABLE "EmployeeAttandence" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "checkIn" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "checkOut" TIMESTAMP(3),
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeAttandence_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePermission" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "permissionId" INTEGER,

    CONSTRAINT "EmployeePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeToEmployeePermission" (
    "employeeId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "EmployeeToEmployeePermission_pkey" PRIMARY KEY ("employeeId","permissionId")
);

-- CreateTable
CREATE TABLE "EmployeePermissionGroup" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "EmployeePermissionGroup_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePermissionGroupToEmployeePermission" (
    "id" SERIAL NOT NULL,
    "permissionGroupId" INTEGER NOT NULL,
    "permissionId" INTEGER NOT NULL,

    CONSTRAINT "EmployeePermissionGroupToEmployeePermission_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeePermissionGroupToEmployee" (
    "id" SERIAL NOT NULL,
    "permissionGroupId" INTEGER NOT NULL,
    "employeeId" INTEGER NOT NULL,

    CONSTRAINT "EmployeePermissionGroupToEmployee_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EmployeeAttandence" ADD CONSTRAINT "EmployeeAttandence_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeAttandence" ADD CONSTRAINT "EmployeeAttandence_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "EmployeeDevices"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePermission" ADD CONSTRAINT "EmployeePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "EmployeePermission"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeToEmployeePermission" ADD CONSTRAINT "EmployeeToEmployeePermission_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeToEmployeePermission" ADD CONSTRAINT "EmployeeToEmployeePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "EmployeePermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePermissionGroupToEmployeePermission" ADD CONSTRAINT "EmployeePermissionGroupToEmployeePermission_permissionId_fkey" FOREIGN KEY ("permissionId") REFERENCES "EmployeePermission"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePermissionGroupToEmployeePermission" ADD CONSTRAINT "EmployeePermissionGroupToEmployeePermission_permissionGrou_fkey" FOREIGN KEY ("permissionGroupId") REFERENCES "EmployeePermissionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePermissionGroupToEmployee" ADD CONSTRAINT "EmployeePermissionGroupToEmployee_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeePermissionGroupToEmployee" ADD CONSTRAINT "EmployeePermissionGroupToEmployee_permissionGroupId_fkey" FOREIGN KEY ("permissionGroupId") REFERENCES "EmployeePermissionGroup"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
