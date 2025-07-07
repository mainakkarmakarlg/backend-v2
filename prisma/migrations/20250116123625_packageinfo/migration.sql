-- AlterTable
ALTER TABLE "PackageInfo" ADD COLUMN     "productId" INTEGER,
ALTER COLUMN "courseId" DROP NOT NULL;

-- AddForeignKey
ALTER TABLE "PackageInfo" ADD CONSTRAINT "PackageInfo_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "PackageInfo" ADD CONSTRAINT "PackageInfo_productId_fkey" FOREIGN KEY ("productId") REFERENCES "Product"("id") ON DELETE SET NULL ON UPDATE CASCADE;
