-- CreateTable
CREATE TABLE "ExtraOption" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "required" BOOLEAN NOT NULL,
    "optionId" INTEGER,
    "courseId" INTEGER,
    "productId" INTEGER,

    CONSTRAINT "ExtraOption_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "ExtraOption" ADD CONSTRAINT "ExtraOption_optionId_fkey" FOREIGN KEY ("optionId") REFERENCES "ExtraOption"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraOption" ADD CONSTRAINT "ExtraOption_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "ExtraOption" ADD CONSTRAINT "ExtraOption_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
