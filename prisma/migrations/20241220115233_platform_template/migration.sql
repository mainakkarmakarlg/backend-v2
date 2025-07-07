-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "auth" TEXT;

-- CreateTable
CREATE TABLE "PlatformTemplate" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "templateId" TEXT NOT NULL,
    "platformId" INTEGER NOT NULL,

    CONSTRAINT "PlatformTemplate_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlatformTemplate" ADD CONSTRAINT "PlatformTemplate_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
