-- CreateTable
CREATE TABLE "CourseSubjectResultToUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "subjectId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "result" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseSubjectResultToUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseSubjectResultToUser" ADD CONSTRAINT "CourseSubjectResultToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubjectResultToUser" ADD CONSTRAINT "CourseSubjectResultToUser_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CourseSubject"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubjectResultToUser" ADD CONSTRAINT "CourseSubjectResultToUser_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
