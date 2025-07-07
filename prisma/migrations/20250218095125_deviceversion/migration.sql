-- AlterTable
ALTER TABLE "Platform" ADD COLUMN     "version" TEXT;

-- CreateTable
CREATE TABLE "UserDevice" (
    "id" SERIAL NOT NULL,
    "name" TEXT,
    "deviceId" TEXT,
    "deviceModel" TEXT,
    "deviceOS" TEXT,
    "platformId" INTEGER NOT NULL,

    CONSTRAINT "UserDevice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserToDevice" (
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "isAllowed" BOOLEAN,

    CONSTRAINT "UserToDevice_pkey" PRIMARY KEY ("userId","deviceId")
);

-- CreateTable
CREATE TABLE "UserDeviceHistory" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "deviceId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserDeviceHistory_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserDevice" ADD CONSTRAINT "UserDevice_platformId_fkey" FOREIGN KEY ("platformId") REFERENCES "Platform"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToDevice" ADD CONSTRAINT "UserToDevice_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserToDevice" ADD CONSTRAINT "UserToDevice_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "UserDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDeviceHistory" ADD CONSTRAINT "UserDeviceHistory_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserDeviceHistory" ADD CONSTRAINT "UserDeviceHistory_deviceId_fkey" FOREIGN KEY ("deviceId") REFERENCES "UserDevice"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
