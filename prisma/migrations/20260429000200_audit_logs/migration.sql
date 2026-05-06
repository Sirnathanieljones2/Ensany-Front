CREATE TABLE "AuditLog" (
  "id" UUID NOT NULL,
  "actorUserId" UUID,
  "actorEmail" TEXT,
  "action" TEXT NOT NULL,
  "targetType" TEXT,
  "targetId" TEXT,
  "metadata" JSONB,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "requestId" TEXT,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "AuditLog_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "AuditLog_actorUserId_createdAt_idx" ON "AuditLog"("actorUserId", "createdAt");
CREATE INDEX "AuditLog_action_createdAt_idx" ON "AuditLog"("action", "createdAt");
CREATE INDEX "AuditLog_targetType_targetId_idx" ON "AuditLog"("targetType", "targetId");
CREATE INDEX "AuditLog_requestId_idx" ON "AuditLog"("requestId");

ALTER TABLE "AuditLog"
  ADD CONSTRAINT "AuditLog_actorUserId_fkey"
  FOREIGN KEY ("actorUserId") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
