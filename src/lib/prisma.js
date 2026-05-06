import { PrismaClient } from "@prisma/client";
import { Pool } from "pg";
import { PrismaPg } from "@prisma/adapter-pg";
import { env } from "../config/env.js";

const pool = new Pool({
  connectionString: env.databaseUrl,
  max: 10,
  idleTimeoutMillis: 30_000,
  connectionTimeoutMillis: 10_000,
});

const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: env.nodeEnv === "development" ? ["warn", "error"] : ["error"],
});
