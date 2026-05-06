import { prisma } from "../lib/prisma.js";
import { logger } from "../utils/logger.js";

function cleanMetadata(value) {
  if (value === undefined) return undefined;
  if (value === null) return null;
  if (Array.isArray(value)) return value.map(cleanMetadata);
  if (value instanceof Date) return value.toISOString();

  if (typeof value === "object") {
    return Object.fromEntries(
      Object.entries(value)
        .filter(([, entryValue]) => entryValue !== undefined)
        .map(([key, entryValue]) => [key, cleanMetadata(entryValue)]),
    );
  }

  return value;
}

export async function recordAuditLog({
  req,
  actorUser,
  action,
  targetType,
  targetId,
  metadata,
}) {
  try {
    const actor = actorUser ?? req?.user;

    await prisma.auditLog.create({
      data: {
        actorUserId: actor?.id ?? null,
        actorEmail: actor?.email ?? null,
        action,
        targetType: targetType ?? null,
        targetId: targetId ?? null,
        metadata: cleanMetadata(metadata) ?? null,
        ipAddress: req?.ip ?? null,
        userAgent: req?.get?.("user-agent") ?? null,
        requestId: req?.requestId ?? null,
      },
    });
  } catch (error) {
    logger.error("audit.write_failed", {
      requestId: req?.requestId,
      action,
      targetType,
      targetId,
      error,
    });
  }
}
