import { env } from "../config/env.js";

const levels = {
  debug: 20,
  info: 30,
  warn: 40,
  error: 50,
};

const configuredLevel = process.env.LOG_LEVEL ?? (env.nodeEnv === "production" ? "info" : "debug");
const minimumLevel = levels[configuredLevel] ?? levels.info;

function normalizeError(error) {
  if (!error) return undefined;

  return {
    name: error.name,
    message: error.message,
    code: error.code,
    stack: env.nodeEnv === "production" ? undefined : error.stack,
  };
}

function emit(level, message, context = {}) {
  if (levels[level] < minimumLevel) return;

  const payload = {
    level,
    message,
    service: "ensany-api",
    environment: env.nodeEnv,
    timestamp: new Date().toISOString(),
    ...context,
  };

  if (context.error instanceof Error) {
    payload.error = normalizeError(context.error);
  }

  const line = JSON.stringify(payload);
  if (level === "error") {
    console.error(line);
  } else if (level === "warn") {
    console.warn(line);
  } else {
    console.log(line);
  }
}

export const logger = {
  debug: (message, context) => emit("debug", message, context),
  info: (message, context) => emit("info", message, context),
  warn: (message, context) => emit("warn", message, context),
  error: (message, context) => emit("error", message, context),
};
