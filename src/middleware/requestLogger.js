import crypto from "node:crypto";
import { logger } from "../utils/logger.js";

const quietPaths = new Set(["/health", "/ready"]);

export function requestLogger(req, res, next) {
  const startedAt = process.hrtime.bigint();
  const requestId = req.get("x-request-id") || crypto.randomUUID();

  req.requestId = requestId;
  res.setHeader("X-Request-Id", requestId);

  res.on("finish", () => {
    if (quietPaths.has(req.path)) return;

    const durationMs = Number(process.hrtime.bigint() - startedAt) / 1_000_000;
    const statusCode = res.statusCode;
    const level = statusCode >= 500 ? "error" : statusCode >= 400 ? "warn" : "info";

    logger[level]("request.completed", {
      requestId,
      method: req.method,
      path: req.originalUrl,
      statusCode,
      durationMs: Math.round(durationMs),
      actorUserId: req.user?.id,
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
  });

  next();
}
