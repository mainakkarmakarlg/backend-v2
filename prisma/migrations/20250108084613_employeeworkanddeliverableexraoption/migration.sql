-- AlterTable
ALTER TABLE "EmployeePersonal" ADD COLUMN     "EmergencyContact" TEXT,
ADD COLUMN     "EmergencyRelation" TEXT,
ADD COLUMN     "emergencyNumber" TEXT;

-- AlterTable
ALTER TABLE "ExtraOption" ADD COLUMN     "isDeliverable" BOOLEAN;
