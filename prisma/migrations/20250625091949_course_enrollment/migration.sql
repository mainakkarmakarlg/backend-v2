-- CreateTable
CREATE TABLE "CourseUserMeta" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,
    "enrollmentId" TEXT,
    "isCompleted" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "CourseUserMeta_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "CourseUserMeta" ADD CONSTRAINT "CourseUserMeta_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseUserMeta" ADD CONSTRAINT "CourseUserMeta_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
