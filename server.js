import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import brokerRoutes from "./src/routes/brokerRoutes.js";
import resendWebhookRoutes from "./src/routes/resendWebhookRoutes.js";
import requestRoutes from "./src/routes/requestRoutes.js";
import trackingRoutes from "./src/routes/trackingRoutes.js";
import { env } from "./src/config/env.js";
import { prisma } from "./src/lib/prisma.js";
import { requestLogger } from "./src/middleware/requestLogger.js";
import { AppError } from "./src/utils/errors.js";
import { logger } from "./src/utils/logger.js";

const app = express();

app.set("trust proxy", 1);

app.use(
  helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" },
  }),
);
app.use(
  cors({
    origin: env.clientOrigin,
    credentials: true,
  }),
);
app.use(requestLogger);
app.use("/api/webhooks/resend", express.raw({ type: "application/json", limit: "250kb" }), resendWebhookRoutes);
app.use(express.json({ limit: "100kb" }));
app.use(
  rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 300,
    skip: (req) => req.path === "/health" || req.path === "/ready",
    standardHeaders: true,
    legacyHeaders: false,
  }),
);

app.get("/", (_req, res) => {
  res.json({
    name: "Ensany API",
    status: "ok",
  });
});

app.get("/health", (_req, res) => {
  res.json({
    status: "ok",
    uptimeSeconds: Math.round(process.uptime()),
    timestamp: new Date().toISOString(),
  });
});

app.get(
  "/ready",
  async (_req, res, next) => {
    try {
      await prisma.$queryRaw`SELECT 1`;
      res.json({
        status: "ready",
        database: "ok",
        timestamp: new Date().toISOString(),
      });
    } catch (error) {
      next(new AppError("Database readiness check failed", 503, "DATABASE_NOT_READY"));
    }
  },
);

app.use("/api/admin", adminRoutes);
app.use("/api/auth", authRoutes);
app.use("/api/brokers", brokerRoutes);
app.use("/api/tracking", trackingRoutes);
app.use("/api", requestRoutes);

app.use((_req, _res, next) => {
  next(new AppError("Route not found", 404, "ROUTE_NOT_FOUND"));
});

app.use((err, req, res, _next) => {
  const statusCode = err.statusCode ?? 500;

  logger[statusCode >= 500 ? "error" : "warn"]("request.failed", {
    requestId: req.requestId,
    method: req.method,
    path: req.originalUrl,
    statusCode,
    code: err.code ?? "INTERNAL_ERROR",
    actorUserId: req.user?.id,
    error: err,
  });

  res.status(statusCode).json({
    error: err.message ?? "Internal server error",
    code: err.code ?? "INTERNAL_ERROR",
    requestId: req.requestId,
  });
});

app.listen(env.port, () => {
  logger.info("server.started", { port: env.port, clientOrigin: env.clientOrigin });
});

process.on("unhandledRejection", (error) => {
  logger.error("process.unhandled_rejection", { error });
});

process.on("uncaughtException", (error) => {
  logger.error("process.uncaught_exception", { error });
  process.exit(1);
});
