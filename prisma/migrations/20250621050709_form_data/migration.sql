-- AlterTable
ALTER TABLE "PlatformOptions" ADD COLUMN     "isActive" BOOLEAN;

-- CreateTable
CREATE TABLE "UserForm" (
    "id" SERIAL NOT NULL,
    "form" JSONB,
    "isActive" BOOLEAN,
    "name" TEXT NOT NULL,
    "description" TEXT,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,
    "courseId" INTEGER,

    CONSTRAINT "UserForm_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserFormToUser" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "formId" INTEGER NOT NULL,
    "formData" JSONB,
    "isSubmitted" BOOLEAN,
    "isActive" BOOLEAN,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL,

    CONSTRAINT "UserFormToUser_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserForm" ADD CONSTRAINT "UserForm_courseId_fkey" FOREIGN KEY ("courseId") REFERENCES "Course"("id") ON DELETE SET NULL ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFormToUser" ADD CONSTRAINT "UserFormToUser_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserFormToUser" ADD CONSTRAINT "UserFormToUser_formId_fkey" FOREIGN KEY ("formId") REFERENCES "UserForm"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
