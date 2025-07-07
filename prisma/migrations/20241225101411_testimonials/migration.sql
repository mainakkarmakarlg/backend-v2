-- CreateTable
CREATE TABLE "UserTestimonials" (
    "id" SERIAL NOT NULL,
    "fname" TEXT,
    "lname" TEXT,
    "profile" TEXT,
    "designation" TEXT,
    "review" TEXT,
    "social" JSONB,
    "userId" INTEGER,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserTestimonials_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTestimonialCategory" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "testimonialId" INTEGER,

    CONSTRAINT "UserTestimonialCategory_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTestimonialCategoryToTestimonial" (
    "id" SERIAL NOT NULL,
    "categoryId" INTEGER NOT NULL,
    "testimonial" INTEGER NOT NULL,

    CONSTRAINT "UserTestimonialCategoryToTestimonial_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserTestimonialToCoursendPlatform" (
    "id" SERIAL NOT NULL,
    "testimonialId" INTEGER NOT NULL,
    "courseId" INTEGER,
    "platformId" INTEGER,
    "slug" TEXT,
    "platformFeatured" BOOLEAN,
    "courseFeatured" BOOLEAN,

    CONSTRAINT "UserTestimonialToCoursendPlatform_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserTestimonials" ADD CONSTRAINT "UserTestimonials_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestimonialCategory" ADD CONSTRAINT "UserTestimonialCategory_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "UserTestimonialCategory"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestimonialCategoryToTestimonial" ADD CONSTRAINT "UserTestimonialCategoryToTestimonial_categoryId_fkey" FOREIGN KEY ("categoryId") REFERENCES "UserTestimonialCategory"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestimonialCategoryToTestimonial" ADD CONSTRAINT "UserTestimonialCategoryToTestimonial_testimonial_fkey" FOREIGN KEY ("testimonial") REFERENCES "UserTestimonials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestimonialToCoursendPlatform" ADD CONSTRAINT "UserTestimonialToCoursendPlatform_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestimonialToCoursendPlatform" ADD CONSTRAINT "UserTestimonialToCoursendPlatform_testimonialId_fkey" FOREIGN KEY ("testimonialId") REFERENCES "UserTestimonials"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserTestimonialToCoursendPlatform" ADD CONSTRAINT "UserTestimonialToCoursendPlatform_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE SET NULL ON UPDATE CASCADE;
