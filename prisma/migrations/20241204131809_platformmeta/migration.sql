-- CreateTable
CREATE TABLE "PlatformOptions" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB NOT NULL,
    "platformId" INTEGER NOT NULL,
    "type" TEXT NOT NULL,
    "valueText" TEXT NOT NULL,

    CONSTRAINT "PlatformOptions_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "PlatformOptions" ADD CONSTRAINT "PlatformOptions_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
