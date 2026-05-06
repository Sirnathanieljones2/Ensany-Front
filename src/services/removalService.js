import crypto from "node:crypto";
import { prisma } from "../lib/prisma.js";
import { sendRemovalEmail } from "../email/emailService.js";
import { AppError } from "../utils/errors.js";

function nextFollowupDate() {
  const date = new Date();
  date.setDate(date.getDate() + 14);
  return date;
}

function missingIntakeFields(profile) {
  const requiredFields = ["fullName", "phone", "address", "city", "country"];
  return requiredFields.filter((field) => !String(profile?.[field] ?? "").trim());
}

async function recordEvent(removalRequestId, type, metadata = undefined) {
  return prisma.emailEvent.create({
    data: {
      removalRequestId,
      type,
      metadata,
    },
  });
}

export async function startRemoval(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  if (!user.profile) {
    throw new AppError("Complete your profile before starting removals", 400, "PROFILE_REQUIRED");
  }

  const missingFields = missingIntakeFields(user.profile);
  if (missingFields.length) {
    throw new AppError(
      `Complete your profile before starting removals: ${missingFields.join(", ")}`,
      400,
      "PROFILE_INCOMPLETE",
    );
  }

  const brokers = await prisma.broker.findMany({
    where: { status: "ACTIVE" },
    orderBy: [{ country: "asc" }, { name: "asc" }],
  });

  const results = [];

  for (const broker of brokers) {
    const request = await prisma.removalRequest.upsert({
      where: {
        userId_brokerId: {
          userId,
          brokerId: broker.id,
        },
      },
      update: {},
      create: {
        userId,
        brokerId: broker.id,
        status: broker.removalMethod === "FORM" ? "FORM_REQUIRED" : "QUEUED",
        trackingToken: crypto.randomBytes(32).toString("hex"),
        subject: `Personal data removal request for ${user.profile.fullName}`,
        nextFollowupAt: nextFollowupDate(),
      },
    });

    if (request.status === "FORM_REQUIRED") {
      results.push({ broker: broker.name, status: request.status, requestId: request.id });
      continue;
    }

    await recordEvent(request.id, "QUEUED");

    try {
      const sent = await sendRemovalEmail({
        broker,
        profile: user.profile,
        request,
        user,
      });

      const status = sent.skipped ? "FAILED" : "EMAIL_SENT";
      const updated = await prisma.removalRequest.update({
        where: { id: request.id },
        data: {
          status,
          providerMessageId: sent.providerMessageId ?? null,
          submittedAt: sent.skipped ? null : new Date(),
          emailSentAt: sent.skipped ? null : new Date(),
          failureReason: sent.skipped ? sent.reason : null,
        },
      });

      await recordEvent(updated.id, sent.skipped ? "FAILED" : "SENT", sent);
      results.push({ broker: broker.name, status: updated.status, requestId: updated.id });
    } catch (error) {
      const updated = await prisma.removalRequest.update({
        where: { id: request.id },
        data: {
          status: "FAILED",
          failureReason: error.message,
        },
      });

      await recordEvent(updated.id, "FAILED", { message: error.message });
      results.push({ broker: broker.name, status: updated.status, requestId: updated.id });
    }
  }

  return {
    totalBrokers: brokers.length,
    results,
  };
}

export async function getUserRequests(userId) {
  return prisma.removalRequest.findMany({
    where: { userId },
    include: {
      broker: true,
      emailEvents: {
        orderBy: { occurredAt: "desc" },
        take: 5,
      },
    },
    orderBy: { updatedAt: "desc" },
  });
}

export async function getDashboard(userId) {
  const [requests, totalBrokers] = await Promise.all([
    prisma.removalRequest.findMany({
      where: { userId },
      include: { broker: true },
      orderBy: { updatedAt: "desc" },
    }),
    prisma.broker.count({ where: { status: "ACTIVE" } }),
  ]);

  const byStatus = requests.reduce((acc, request) => {
    acc[request.status] = (acc[request.status] ?? 0) + 1;
    return acc;
  }, {});

  return {
    summary: {
      totalBrokers,
      totalRequests: requests.length,
      sent: byStatus.EMAIL_SENT ?? 0,
      completed: byStatus.COMPLETED ?? 0,
      failed: byStatus.FAILED ?? 0,
      needsAction: (byStatus.FORM_REQUIRED ?? 0) + (byStatus.NEEDS_USER_INFO ?? 0),
      byStatus,
    },
    recentRequests: requests.slice(0, 8),
  };
}

export async function markEmailOpened(trackingToken, metadata) {
  const request = await prisma.removalRequest.findUnique({
    where: { trackingToken },
    select: { id: true },
  });

  if (!request) {
    return false;
  }

  await recordEvent(request.id, "OPENED", metadata);
  return true;
}
