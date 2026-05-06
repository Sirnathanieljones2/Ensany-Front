ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'SCHEDULED';
ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'DELIVERY_DELAYED';
ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'SUPPRESSED';
ALTER TYPE "EmailEventType" ADD VALUE IF NOT EXISTS 'RECEIVED';

CREATE UNIQUE INDEX IF NOT EXISTS "RemovalRequest_providerMessageId_key"
  ON "RemovalRequest"("providerMessageId");

CREATE UNIQUE INDEX IF NOT EXISTS "EmailEvent_providerEventId_key"
  ON "EmailEvent"("providerEventId");
