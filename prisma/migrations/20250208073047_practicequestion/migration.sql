-- CreateTable
CREATE TABLE "PracticeQuestiontoFallNumber" (
    "questionId" INTEGER NOT NULL,
    "fallNumberId" INTEGER NOT NULL,

    CONSTRAINT "PracticeQuestiontoFallNumber_pkey" PRIMARY KEY ("questionId","fallNumberId")
);

-- CreateTable
CREATE TABLE "LectureToCourse" (
    "id" SERIAL NOT NULL,
    "lectureId" INTEGER NOT NULL,
    "courseId" INTEGER NOT NULL,

    CONSTRAINT "LectureToCourse_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "FallNumberToVideoInfo" (
    "fallNumberId" INTEGER NOT NULL,
    "videoId" INTEGER NOT NULL,

    CONSTRAINT "FallNumberToVideoInfo_pkey" PRIMARY KEY ("fallNumberId","videoId")
);

-- AddForeignKey
ALTER TABLE "PracticeQuestiontoFallNumber" ADD CONSTRAINT "PracticeQuestiontoFallNumber_questionId_fkey" FOREIGN KEY ("questionId") REFERENCES "PracticeQuestion"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PracticeQuestiontoFallNumber" ADD CONSTRAINT "PracticeQuestiontoFallNumber_fallNumberId_fkey" FOREIGN KEY ("fallNumberId") REFERENCES "FallNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureToCourse" ADD CONSTRAINT "LectureToCourse_lectureId_fkey" FOREIGN KEY ("lectureId") REFERENCES "LectureInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "LectureToCourse" ADD CONSTRAINT "LectureToCourse_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallNumberToVideoInfo" ADD CONSTRAINT "FallNumberToVideoInfo_fallNumberId_fkey" FOREIGN KEY ("fallNumberId") REFERENCES "FallNumber"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "FallNumberToVideoInfo" ADD CONSTRAINT "FallNumberToVideoInfo_videoId_fkey" FOREIGN KEY ("videoId") REFERENCES "VideoInfo"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
