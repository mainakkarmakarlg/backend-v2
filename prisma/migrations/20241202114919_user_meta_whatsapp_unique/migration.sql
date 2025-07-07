/*
  Warnings:

  - A unique constraint covering the columns `[whatsappNumber]` on the table `UserMeta` will be added. If there are existing duplicate values, this will fail.

*/
-- CreateIndex
CREATE UNIQUE INDEX "UserMeta_whatsappNumber_key" ON "UserMeta"("whatsappNumber");
