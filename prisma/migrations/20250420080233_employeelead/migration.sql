-- CreateTable
CREATE TABLE "UserLeadHistory" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB,
    "valueText" TEXT,
    "leadId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "employeeId" INTEGER,

    CONSTRAINT "UserLeadHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserLeadHistory" ADD CONSTRAINT "UserLeadHistory_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "UserLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadHistory" ADD CONSTRAINT "UserLeadHistory_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;
