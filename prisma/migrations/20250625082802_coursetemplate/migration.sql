-- CreateTable
CREATE TABLE "CourseTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "platformId" INTEGER NOT NULL,
    "senderEmail" TEXT,
    "senderName" TEXT,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "CourseTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseTemplate" ADD CONSTRAINT "CourseTemplate_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseTemplate" ADD CONSTRAINT "CourseTemplate_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
