-- AlterTable
ALTER TABLE "EmployeeToLeadSource" ADD COLUMN     "courseId" INTEGER;

-- AlterTable
ALTER TABLE "UserLead" ADD COLUMN     "call" BOOLEAN;

-- AddForeignKey
ALTER TABLE "UserLeadInteraction" ADD CONSTRAINT "UserLeadInteraction_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "UserLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeToLeadSource" ADD CONSTRAINT "EmployeeToLeadSource_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
