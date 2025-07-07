-- CreateTable
CREATE TABLE "CourseMeta" (
    "id" SERIAL NOT NULL,

    CONSTRAINT "CourseMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Events" (
    "id" SERIAL NOT NULL,
    "title" TEXT NOT NULL,
    "description" TEXT,
    "startDate" TIMESTAMP(3),
    "endDate" TIMESTAMP(3),
    "color" TEXT,

    CONSTRAINT "Events_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventsToCourseNdPlatform" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "platformId" INTEGER,
    "courseId" INTEGER,

    CONSTRAINT "EventsToCourseNdPlatform_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "EventsToCourseNdPlatform" ADD CONSTRAINT "EventsToCourseNdPlatform_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventsToCourseNdPlatform" ADD CONSTRAINT "EventsToCourseNdPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventsToCourseNdPlatform" ADD CONSTRAINT "EventsToCourseNdPlatform_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
