-- Rebuild the early prototype schema into the core Ensany privacy platform schema.
-- This migration is destructive for existing prototype data because ids changed from Int to UUID.

DROP TABLE IF EXISTS "EmailEvent" CASCADE;
DROP TABLE IF EXISTS "RemovalRequest" CASCADE;
DROP TABLE IF EXISTS "Broker" CASCADE;
DROP TABLE IF EXISTS "Profile" CASCADE;
DROP TABLE IF EXISTS "User" CASCADE;

DROP TYPE IF EXISTS "EmailEventType" CASCADE;
DROP TYPE IF EXISTS "RemovalRequestStatus" CASCADE;
DROP TYPE IF EXISTS "RemovalMethod" CASCADE;
DROP TYPE IF EXISTS "BrokerStatus" CASCADE;
DROP TYPE IF EXISTS "UserRole" CASCADE;

CREATE TYPE "UserRole" AS ENUM ('USER', 'ADMIN');
CREATE TYPE "BrokerStatus" AS ENUM ('ACTIVE', 'PAUSED', 'RETIRED');
CREATE TYPE "RemovalMethod" AS ENUM ('EMAIL', 'FORM', 'EMAIL_AND_FORM');
CREATE TYPE "RemovalRequestStatus" AS ENUM (
  'DRAFT',
  'QUEUED',
  'EMAIL_SENT',
  'FORM_REQUIRED',
  'FORM_SUBMITTED',
  'IN_PROGRESS',
  'COMPLETED',
  'REJECTED',
  'FAILED',
  'NEEDS_USER_INFO'
);
CREATE TYPE "EmailEventType" AS ENUM (
  'QUEUED',
  'SENT',
  'DELIVERED',
  'OPENED',
  'CLICKED',
  'BOUNCED',
  'COMPLAINED',
  'REPLIED',
  'FAILED'
);

CREATE TABLE "User" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "role" "UserRole" NOT NULL DEFAULT 'USER',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "User_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Profile" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "fullName" TEXT NOT NULL,
  "phone" TEXT,
  "address" TEXT,
  "city" TEXT,
  "country" TEXT,
  "birthYear" INTEGER,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Profile_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "Broker" (
  "id" UUID NOT NULL,
  "name" TEXT NOT NULL,
  "legalName" TEXT,
  "email" TEXT,
  "privacyEmail" TEXT,
  "website" TEXT,
  "removalFormUrl" TEXT,
  "country" TEXT NOT NULL,
  "region" TEXT,
  "category" TEXT,
  "removalMethod" "RemovalMethod" NOT NULL DEFAULT 'EMAIL',
  "status" "BrokerStatus" NOT NULL DEFAULT 'ACTIVE',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "Broker_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "RemovalRequest" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "brokerId" UUID NOT NULL,
  "status" "RemovalRequestStatus" NOT NULL DEFAULT 'QUEUED',
  "trackingToken" TEXT NOT NULL,
  "providerMessageId" TEXT,
  "subject" TEXT,
  "submittedAt" TIMESTAMP(3),
  "emailSentAt" TIMESTAMP(3),
  "formSubmittedAt" TIMESTAMP(3),
  "responseAt" TIMESTAMP(3),
  "completedAt" TIMESTAMP(3),
  "lastFollowupAt" TIMESTAMP(3),
  "nextFollowupAt" TIMESTAMP(3),
  "failureReason" TEXT,
  "notes" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "RemovalRequest_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "EmailEvent" (
  "id" UUID NOT NULL,
  "removalRequestId" UUID NOT NULL,
  "type" "EmailEventType" NOT NULL,
  "provider" TEXT,
  "providerEventId" TEXT,
  "metadata" JSONB,
  "occurredAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "EmailEvent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "User_email_key" ON "User"("email");
CREATE INDEX "User_createdAt_idx" ON "User"("createdAt");
CREATE UNIQUE INDEX "Profile_userId_key" ON "Profile"("userId");
CREATE UNIQUE INDEX "Broker_name_country_key" ON "Broker"("name", "country");
CREATE INDEX "Broker_country_idx" ON "Broker"("country");
CREATE INDEX "Broker_status_idx" ON "Broker"("status");
CREATE UNIQUE INDEX "RemovalRequest_trackingToken_key" ON "RemovalRequest"("trackingToken");
CREATE UNIQUE INDEX "RemovalRequest_userId_brokerId_key" ON "RemovalRequest"("userId", "brokerId");
CREATE INDEX "RemovalRequest_userId_status_idx" ON "RemovalRequest"("userId", "status");
CREATE INDEX "RemovalRequest_brokerId_status_idx" ON "RemovalRequest"("brokerId", "status");
CREATE INDEX "RemovalRequest_nextFollowupAt_idx" ON "RemovalRequest"("nextFollowupAt");
CREATE INDEX "EmailEvent_removalRequestId_occurredAt_idx" ON "EmailEvent"("removalRequestId", "occurredAt");
CREATE INDEX "EmailEvent_type_idx" ON "EmailEvent"("type");

ALTER TABLE "Profile"
  ADD CONSTRAINT "Profile_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RemovalRequest"
  ADD CONSTRAINT "RemovalRequest_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "RemovalRequest"
  ADD CONSTRAINT "RemovalRequest_brokerId_fkey"
  FOREIGN KEY ("brokerId") REFERENCES "Broker"("id") ON DELETE RESTRICT ON UPDATE CASCADE;

ALTER TABLE "EmailEvent"
  ADD CONSTRAINT "EmailEvent_removalRequestId_fkey"
  FOREIGN KEY ("removalRequestId") REFERENCES "RemovalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;
