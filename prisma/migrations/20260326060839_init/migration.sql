-- CreateTable
CREATE TABLE "User" (
    "id" SERIAL NOT NULL,
    "email" TEXT NOT NULL,
    "password" TEXT NOT NULL,
    "name" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Profile" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "fullName" TEXT NOT NULL,
    "phone" TEXT,
    "address" TEXT,
    "birthYear" INTEGER,

    CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "Broker" (
    "id" SERIAL NOT NULL,
    "name" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "country" TEXT NOT NULL,
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

    CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

-- CreateTable
CREATE TABLE "RemovalRequest" (
    "id" SERIAL NOT NULL,
    "userId" INTEGER NOT NULL,
    "brokerId" INTEGER NOT NULL,
    "status" TEXT NOT NULL,
    "emailSentAt" TIMESTAMP(3),
    "responseAt" TIMESTAMP(3),
    "lastFollowup" TIMESTAMP(3),

    CONSTRAINT "RemovalRequest_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "User_email_key" ON "User"("email");

-- CreateIndex
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");

-- AddForeignKey
ALTER TABLE "Profile" ADD CONSTRAINT "Profile_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemovalRequest" ADD CONSTRAINT "RemovalRequest_userId_fkey" FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "RemovalRequest" ADD CONSTRAINT "RemovalRequest_brokerId_fkey" FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;
