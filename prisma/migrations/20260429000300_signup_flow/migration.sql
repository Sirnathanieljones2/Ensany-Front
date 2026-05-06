CREATE TABLE "PendingSignup" (
  "id" UUID NOT NULL,
  "email" TEXT NOT NULL,
  "passwordHash" TEXT NOT NULL,
  "displayName" TEXT NOT NULL,
  "verificationCodeHash" TEXT NOT NULL,
  "verificationTokenHash" TEXT,
  "verifiedAt" TIMESTAMP(3),
  "consumedAt" TIMESTAMP(3),
  "expiresAt" TIMESTAMP(3) NOT NULL,
  "attemptCount" INTEGER NOT NULL DEFAULT 0,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "updatedAt" TIMESTAMP(3) NOT NULL,

  CONSTRAINT "PendingSignup_pkey" PRIMARY KEY ("id")
);

CREATE TABLE "UserAuthorizationConsent" (
  "id" UUID NOT NULL,
  "userId" UUID NOT NULL,
  "consentVersion" TEXT NOT NULL,
  "consentText" TEXT NOT NULL,
  "removalAuthorization" BOOLEAN NOT NULL,
  "electronicSignature" TEXT NOT NULL,
  "ipAddress" TEXT,
  "userAgent" TEXT,
  "acceptedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,

  CONSTRAINT "UserAuthorizationConsent_pkey" PRIMARY KEY ("id")
);

CREATE UNIQUE INDEX "PendingSignup_email_key" ON "PendingSignup"("email");
CREATE UNIQUE INDEX "PendingSignup_verificationTokenHash_key" ON "PendingSignup"("verificationTokenHash");
CREATE INDEX "PendingSignup_email_idx" ON "PendingSignup"("email");
CREATE INDEX "PendingSignup_expiresAt_idx" ON "PendingSignup"("expiresAt");
CREATE INDEX "UserAuthorizationConsent_userId_acceptedAt_idx" ON "UserAuthorizationConsent"("userId", "acceptedAt");

ALTER TABLE "UserAuthorizationConsent"
  ADD CONSTRAINT "UserAuthorizationConsent_userId_fkey"
  FOREIGN KEY ("userId") REFERENCES "User"("id") ON DELETE CASCADE ON UPDATE CASCADE;
