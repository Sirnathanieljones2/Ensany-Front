import { Resend } from "resend";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { AppError } from "../utils/errors.js";

const resend = new Resend(env.resendApiKey ?? "re_dev_placeholder");

const eventTypeMap = {
  "email.scheduled": "SCHEDULED",
  "email.sent": "SENT",
  "email.delivered": "DELIVERED",
  "email.delivery_delayed": "DELIVERY_DELAYED",
  "email.opened": "OPENED",
  "email.clicked": "CLICKED",
  "email.bounced": "BOUNCED",
  "email.complained": "COMPLAINED",
  "email.suppressed": "SUPPRESSED",
  "email.received": "RECEIVED",
  "email.failed": "FAILED",
};

function extractTags(tags) {
  if (!tags) {
    return {};
  }

  if (Array.isArray(tags)) {
    return tags.reduce((acc, tag) => {
      if (tag?.name && tag?.value) {
        acc[tag.name] = tag.value;
      }
      return acc;
    }, {});
  }

  if (typeof tags === "object") {
    return tags;
  }

  return {};
}

function getFailureReason(event) {
  return (
    event.data?.bounce?.message ??
    event.data?.error?.message ??
    event.data?.reason ??
    event.type
  );
}

function statusPatchForEvent(event, occurredAt) {
  switch (event.type) {
    case "email.scheduled":
      return { status: "QUEUED" };
    case "email.sent":
      return {
        status: "EMAIL_SENT",
        submittedAt: occurredAt,
        emailSentAt: occurredAt,
        failureReason: null,
      };
    case "email.delivered":
      return { status: "IN_PROGRESS", failureReason: null };
    case "email.received":
      return { status: "IN_PROGRESS", responseAt: occurredAt };
    case "email.bounced":
    case "email.complained":
    case "email.failed":
    case "email.suppressed":
      return {
        status: "FAILED",
        failureReason: getFailureReason(event),
      };
    default:
      return {};
  }
}

async function findRemovalRequest(event) {
  const emailId = event.data?.email_id;
  const tags = extractTags(event.data?.tags);
  const requestId = tags.request_id;

  if (emailId) {
    const byEmailId = await prisma.removalRequest.findUnique({
      where: { providerMessageId: emailId },
      select: { id: true },
    });

    if (byEmailId) {
      return byEmailId;
    }
  }

  if (requestId) {
    return prisma.removalRequest.findUnique({
      where: { id: requestId },
      select: { id: true },
    });
  }

  return null;
}

export function verifyResendWebhook(payload, headers) {
  if (!env.resendWebhookSecret) {
    throw new AppError("RESEND_WEBHOOK_SECRET is not configured", 500, "WEBHOOK_SECRET_MISSING");
  }

  try {
    return resend.webhooks.verify({
      payload,
      headers: {
        id: headers.id,
        timestamp: headers.timestamp,
        signature: headers.signature,
      },
      webhookSecret: env.resendWebhookSecret,
    });
  } catch (_error) {
    throw new AppError("Invalid Resend webhook signature", 400, "INVALID_WEBHOOK_SIGNATURE");
  }
}

export async function processResendWebhook(event, providerEventId) {
  const mappedType = eventTypeMap[event.type];

  if (!mappedType) {
    return {
      ignored: true,
      reason: `Unsupported Resend event type: ${event.type}`,
    };
  }

  const request = await findRemovalRequest(event);

  if (!request) {
    return {
      ignored: true,
      reason: "No matching removal request found",
    };
  }

  if (providerEventId) {
    const existingEvent = await prisma.emailEvent.findUnique({
      where: { providerEventId },
      select: { removalRequestId: true },
    });

    if (existingEvent) {
      return {
        duplicate: true,
        removalRequestId: existingEvent.removalRequestId,
      };
    }
  }

  const occurredAt = event.created_at ? new Date(event.created_at) : new Date();
  const statusPatch = statusPatchForEvent(event, occurredAt);

  try {
    await prisma.$transaction([
      prisma.emailEvent.create({
        data: {
          removalRequestId: request.id,
          type: mappedType,
          provider: "resend",
          providerEventId,
          metadata: event,
          occurredAt,
        },
      }),
      prisma.removalRequest.update({
        where: { id: request.id },
        data: statusPatch,
      }),
    ]);
  } catch (error) {
    if (error.code === "P2002") {
      return {
        duplicate: true,
        removalRequestId: request.id,
      };
    }

    throw error;
  }

  return {
    processed: true,
    eventType: mappedType,
    removalRequestId: request.id,
  };
}
