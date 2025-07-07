-- CreateTable
CREATE TABLE "UserPayments" (
    "id" SERIAL NOT NULL,
    "orderId" TEXT NOT NULL,
    "gatewayId" INTEGER NOT NULL,
    "gatewayOrderId" TEXT NOT NULL,
    "status" TEXT NOT NULL,
    "amount" INTEGER NOT NULL,
    "userId" INTEGER NOT NULL,
    "userFrom" INTEGER,

    CONSTRAINT "UserPayments_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "UserInvoice" (
    "id" SERIAL NOT NULL,
    "paymentId" INTEGER NOT NULL,
    "paymentMode" TEXT NOT NULL,

    CONSTRAINT "UserInvoice_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "PaymentGatways" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "apiKey" TEXT,
    "apiSecret" TEXT,

    CONSTRAINT "PaymentGatways_pkey" PRIMARY KEY ("id")
);

-- AddForeignKey
ALTER TABLE "UserPayments" ADD CONSTRAINT "UserPayments_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "UserPayments" ADD CONSTRAINT "UserPayments_gatewayId_fkey" FOREIGN KEY ("gatewayId") REFERENCES "PaymentGatways"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
