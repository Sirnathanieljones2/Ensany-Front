import fs from "node:fs";
import dotenv from "dotenv";

const envPath = fs.existsSync(".env") ? ".env" : "env";
dotenv.config({ path: envPath });

const requiredInProduction = ["DATABASE_URL", "JWT_SECRET"];

for (const key of requiredInProduction) {
  if (process.env.NODE_ENV === "production" && !process.env[key]) {
    throw new Error(`Missing required environment variable: ${key}`);
  }
}

export const env = {
  appUrl: process.env.APP_URL ?? "http://localhost:5000",
  clientOrigin: process.env.CLIENT_ORIGIN ?? "http://localhost:5173",
  databaseUrl: process.env.DATABASE_URL,
  disableEmailSend: process.env.DISABLE_EMAIL_SEND === "true",
  emailFrom: process.env.EMAIL_FROM ?? process.env.EMAIL_USER,
  jwtSecret:
    process.env.JWT_SECRET ??
    "dev-only-change-this-secret-before-production-use-please",
  nodeEnv: process.env.NODE_ENV ?? "development",
  port: Number(process.env.PORT ?? 5000),
  resendApiKey: process.env.RESEND_API_KEY,
  resendWebhookSecret: process.env.RESEND_WEBHOOK_SECRET,
};
