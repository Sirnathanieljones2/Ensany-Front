import jwt from "jsonwebtoken";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

export function requireAuth(req, _res, next) {
  const header = req.get("authorization");
  const token = header?.startsWith("Bearer ") ? header.slice(7) : null;

  if (!token) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  try {
    const payload = jwt.verify(token, env.jwtSecret);
    req.user = {
      id: payload.sub,
      email: payload.email,
      role: payload.role,
    };
    return next();
  } catch (_error) {
    return next(new AppError("Invalid or expired token", 401, "INVALID_TOKEN"));
  }
}

export function requireAdmin(req, _res, next) {
  if (!req.user) {
    return next(new AppError("Authentication required", 401, "AUTH_REQUIRED"));
  }

  if (req.user.role !== "ADMIN") {
    return next(new AppError("Admin access required", 403, "ADMIN_REQUIRED"));
  }

  return next();
}
