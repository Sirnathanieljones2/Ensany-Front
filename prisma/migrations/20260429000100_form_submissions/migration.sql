CREATE TABLE "FormSubmission" (
  "id" UUID NOT NULL,
  "removalRequestId" UUID NOT NULL,
  "submittedById" UUID,
  "targetUrl" TEXT,
  "confirmationCode" TEXT,
  "evidenceUrl" TEXT,
  "notes" TEXT,
  "submittedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "nextFollowupAt" TIMESTAMP(3),
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "FormSubmission_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "FormSubmission_removalRequestId_submittedAt_idx" ON "FormSubmission"("removalRequestId", "submittedAt");
CREATE INDEX "FormSubmission_submittedById_idx" ON "FormSubmission"("submittedById");

ALTER TABLE "FormSubmission"
  ADD CONSTRAINT "FormSubmission_removalRequestId_fkey"
  FOREIGN KEY ("removalRequestId") REFERENCES "RemovalRequest"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "FormSubmission"
  ADD CONSTRAINT "FormSubmission_submittedById_fkey"
  FOREIGN KEY ("submittedById") REFERENCES "User"("id") ON DELETE SET NULL ON UPDATE CASCADE;
