-- AlterTable
ALTER TABLE "UserContactForm" ADD COLUMN     "leadId" INTEGER,
ADD COLUMN     "previousForm" INTEGER;

-- CreateTable
CREATE TABLE "UserLead" (
    "id" SERIAL NOT NULL,
    "fname" TEXT NOT NULL,
    "lname" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "phone" TEXT NOT NULL,
    "status" TEXT,
    "whatsapp" TEXT,
    "whatsappCountryCode" TEXT,
    "sourceId" INTEGER,
    "priority" INTEGER NOT NULL,
    "platform" TEXT NOT NULL,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLead_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLeadToCourseNdProduct" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "productId" INTEGER,
    "courseId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLeadToCourseNdProduct_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserLeadInteraction" (
    "id" SERIAL NOT NULL,
    "leadId" INTEGER NOT NULL,
    "employeeId" INTEGER,
    "callDialTime" TIMESTAMP(3),
    "callUpTime" TIMESTAMP(3),
    "callEndTime" TIMESTAMP(3),
    "mode" TEXT,
    "remarks" TEXT,
    "status" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserLeadInteraction_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "LeadSource" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,

    CONSTRAINT "LeadSource_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EmployeeToLeadSource" (
    "id" SERIAL NOT NULL,
    "employeeId" INTEGER NOT NULL,
    "sourceId" INTEGER NOT NULL,
    "priority" INTEGER NOT NULL,
    "hierarchy" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EmployeeToLeadSource_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserContactForm" ADD CONSTRAINT "UserContactForm_previousForm_fkey" FOREIGN KEY ("previousForm") REFERENCES "UserContactForm"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserContactForm" ADD CONSTRAINT "UserContactForm_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "UserLead"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLead" ADD CONSTRAINT "UserLead_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLead" ADD CONSTRAINT "UserLead_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LeadSource"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadToCourseNdProduct" ADD CONSTRAINT "UserLeadToCourseNdProduct_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadToCourseNdProduct" ADD CONSTRAINT "UserLeadToCourseNdProduct_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadToCourseNdProduct" ADD CONSTRAINT "UserLeadToCourseNdProduct_leadId_fkey" FOREIGN KEY ("leadId") REFERENCES "UserLead"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserLeadInteraction" ADD CONSTRAINT "UserLeadInteraction_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeToLeadSource" ADD CONSTRAINT "EmployeeToLeadSource_employeeId_fkey" FOREIGN KEY ("employeeId") REFERENCES "Employee"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EmployeeToLeadSource" ADD CONSTRAINT "EmployeeToLeadSource_sourceId_fkey" FOREIGN KEY ("sourceId") REFERENCES "LeadSource"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
