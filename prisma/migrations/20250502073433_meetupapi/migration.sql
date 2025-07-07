-- AlterTable
ALTER TABLE "Events" ADD COLUMN     "type" TEXT;

-- CreateTable
CREATE TABLE "EventsMeta" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "longDescription" TEXT,
    "shortDescription" TEXT,
    "registrationStartDate" TIMESTAMP(3),
    "registrationEndDate" TIMESTAMP(3),
    "addressLink" TEXT,
    "eventLogo" TEXT,

    CONSTRAINT "EventsMeta_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventsOptions" (
    "id" SERIAL NOT NULL,
    "key" TEXT NOT NULL,
    "valueJson" JSONB,
    "eventId" INTEGER NOT NULL,
    "type" TEXT,
    "valueText" TEXT,

    CONSTRAINT "EventsOptions_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventToUser" (
    "id" SERIAL NOT NULL,
    "fname" TEXT,
    "lname" TEXT,
    "email" TEXT,
    "countryCode" TEXT,
    "phone" TEXT,
    "attending" TEXT,
    "responseJson" JSONB,
    "eventId" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventToUser_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Gallery" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "type" TEXT NOT NULL,
    "description" TEXT,
    "link" TEXT NOT NULL,

    CONSTRAINT "Gallery_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "EventToGallery" (
    "id" SERIAL NOT NULL,
    "eventId" INTEGER NOT NULL,
    "galleryId" INTEGER NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "EventToGallery_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "EventsMeta_eventId_key" ON "EventsMeta"("eventId");

-- AddForeignKey
ALTER TABLE "EventsMeta" ADD CONSTRAINT "EventsMeta_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventsOptions" ADD CONSTRAINT "EventsOptions_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventToUser" ADD CONSTRAINT "EventToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventToUser" ADD CONSTRAINT "EventToUser_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventToGallery" ADD CONSTRAINT "EventToGallery_eventId_fkey" FOREIGN KEY ("eventId") REFERENCES "Events"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "EventToGallery" ADD CONSTRAINT "EventToGallery_galleryId_fkey" FOREIGN KEY ("galleryId") REFERENCES "Gallery"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
