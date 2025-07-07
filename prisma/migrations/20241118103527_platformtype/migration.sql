-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "FaqSubject" (
    "id" SERIAL NOT NULL,
    "heading" TEXT,
    "description" TEXT,
    "logo" TEXT,
    "faqSubjectId" INTEGER,

    CONSTRAINT "FaqSubject_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqQuestion" (
    "id" SERIAL NOT NULL,
    "question" TEXT NOT NULL,
    "answer" TEXT NOT NULL,
    "subjectId" INTEGER NOT NULL,

    CONSTRAINT "FaqQuestion_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FaqToCourseNdPlatform" (
    "id" SERIAL NOT NULL,
    "faqSubjectId" INTEGER NOT NULL,
    "platformId" INTEGER,
    "courseId" INTEGER,

    CONSTRAINT "FaqToCourseNdPlatform_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "FaqSubject" ADD CONSTRAINT "FaqSubject_faqSubjectId_fkey" FOREIGN KEY ("faqSubjectId") REFERENCES "FaqSubject"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqQuestion" ADD CONSTRAINT "FaqQuestion_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "FaqSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqToCourseNdPlatform" ADD CONSTRAINT "FaqToCourseNdPlatform_faqSubjectId_fkey" FOREIGN KEY ("faqSubjectId") REFERENCES "FaqSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqToCourseNdPlatform" ADD CONSTRAINT "FaqToCourseNdPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FaqToCourseNdPlatform" ADD CONSTRAINT "FaqToCourseNdPlatform_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;
