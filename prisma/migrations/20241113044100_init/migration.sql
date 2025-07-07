/*
  Warnings:

  - A unique constraint covering the columns `[userId]` on the table `UserToPlatform` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateTable
CREATE TABLE "UserRefreshToken" (
    "userId" INTEGER NOT NULL,
    "platformId" INTEGER NOT NULL,
    "token" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "UserRefreshToken_pkey" PRIMARY KEY ("userId","platformId")
);

-- CreateTable
CREATE TABLE "PlatformToCourse" (
    "platformId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "PlatformToCourse_pkey" PRIMARY KEY ("platformId","courseId")
);

-- CreateTable
CREATE TABLE "CourseSubjects" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "order" INTEGER NOT NULL,
    "subjectId" INTEGER,
    "courseId" INTEGER,

    CONSTRAINT "CourseSubjects_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "UserToPlatform_userId_key" ON "UserToPlatform"("userId");

-- AddForeignKey
ALTER TABLE "UserRefreshToken" ADD CONSTRAINT "UserRefreshToken_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserRefreshToken" ADD CONSTRAINT "UserRefreshToken_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToPlatform" ADD CONSTRAINT "UserToPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToPlatform" ADD CONSTRAINT "UserToPlatform_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformToCourse" ADD CONSTRAINT "PlatformToCourse_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PlatformToCourse" ADD CONSTRAINT "PlatformToCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubjects" ADD CONSTRAINT "CourseSubjects_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "CourseSubjects" ADD CONSTRAINT "CourseSubjects_subjectId_fkey" FOREIGN KEY ("subjectId") REFERENCES "CourseSubjects"("id") ON DELETE SET NULL ON UPDATE CASCADE;
