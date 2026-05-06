CREATE TYPE "BrokerRiskLevel" AS ENUM ('UNKNOWN', 'LOW', 'MEDIUM', 'HIGH');

ALTER TABLE "Broker"
  ADD COLUMN "escalationEmail" TEXT,
  ADD COLUMN "expectedResponseDays" INTEGER,
  ADD COLUMN "removalInstructions" TEXT,
  ADD COLUMN "requiredData" JSONB,
  ADD COLUMN "riskLevel" "BrokerRiskLevel" NOT NULL DEFAULT 'UNKNOWN';
