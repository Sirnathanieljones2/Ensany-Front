import { prisma } from "../lib/prisma.js";
import { AppError } from "../utils/errors.js";

function cleanBrokerInput(input, { partial = false } = {}) {
  const normalized = {};
  const setNullable = (field) => {
    if (!partial || Object.hasOwn(input, field)) {
      normalized[field] = input[field] || null;
    }
  };

  for (const field of ["name", "country", "removalMethod", "riskLevel", "status"]) {
    if (!partial || Object.hasOwn(input, field)) {
      normalized[field] = input[field];
    }
  }

  for (const field of [
    "legalName",
    "email",
    "privacyEmail",
    "escalationEmail",
    "website",
    "removalFormUrl",
    "region",
    "category",
    "removalInstructions",
  ]) {
    setNullable(field);
  }

  if (!partial || Object.hasOwn(input, "expectedResponseDays")) {
    normalized.expectedResponseDays = input.expectedResponseDays ?? null;
  }

  if (!partial || Object.hasOwn(input, "requiredData")) {
    normalized.requiredData = input.requiredData?.length ? input.requiredData : null;
  }

  return normalized;
}

export async function getAdminOverview() {
  const [
    totalUsers,
    totalBrokers,
    activeBrokers,
    totalRequests,
    requestStatuses,
    dueFollowups,
  ] = await Promise.all([
    prisma.user.count(),
    prisma.broker.count(),
    prisma.broker.count({ where: { status: "ACTIVE" } }),
    prisma.removalRequest.count(),
    prisma.removalRequest.groupBy({
      by: ["status"],
      _count: { status: true },
    }),
    prisma.removalRequest.count({
      where: {
        nextFollowupAt: { lte: new Date() },
        status: { notIn: ["COMPLETED", "REJECTED"] },
      },
    }),
  ]);

  return {
    totalUsers,
    totalBrokers,
    activeBrokers,
    totalRequests,
    dueFollowups,
    requestStatuses: requestStatuses.reduce((acc, item) => {
      acc[item.status] = item._count.status;
      return acc;
    }, {}),
  };
}

export async function listAdminBrokers(filters) {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.removalMethod ? { removalMethod: filters.removalMethod } : {}),
    ...(filters.riskLevel ? { riskLevel: filters.riskLevel } : {}),
    ...(filters.country ? { country: { contains: filters.country, mode: "insensitive" } } : {}),
    ...(filters.q
      ? {
          OR: [
            { name: { contains: filters.q, mode: "insensitive" } },
            { legalName: { contains: filters.q, mode: "insensitive" } },
            { category: { contains: filters.q, mode: "insensitive" } },
          ],
        }
      : {}),
  };

  const [brokers, total] = await Promise.all([
    prisma.broker.findMany({
      where,
      include: {
        _count: {
          select: { requests: true },
        },
      },
      orderBy: [{ status: "asc" }, { country: "asc" }, { name: "asc" }],
      take: filters.take,
      skip: filters.skip,
    }),
    prisma.broker.count({ where }),
  ]);

  return { brokers, total };
}

export async function createBroker(input) {
  return prisma.broker.create({
    data: cleanBrokerInput(input),
  });
}

export async function updateBroker(brokerId, input) {
  try {
    return await prisma.broker.update({
      where: { id: brokerId },
      data: cleanBrokerInput(input, { partial: true }),
    });
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Broker not found", 404, "BROKER_NOT_FOUND");
    }

    throw error;
  }
}

export async function listAdminRequests(filters) {
  const where = {
    ...(filters.status ? { status: filters.status } : {}),
    ...(filters.brokerId ? { brokerId: filters.brokerId } : {}),
    ...(filters.userId ? { userId: filters.userId } : {}),
    ...(filters.q
      ? {
          OR: [
            { user: { email: { contains: filters.q, mode: "insensitive" } } },
            { user: { displayName: { contains: filters.q, mode: "insensitive" } } },
            { broker: { name: { contains: filters.q, mode: "insensitive" } } },
            { broker: { country: { contains: filters.q, mode: "insensitive" } } },
          ],
        }
      : {}),
  };

  const [requests, total] = await Promise.all([
    prisma.removalRequest.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            email: true,
            displayName: true,
            profile: true,
          },
        },
        broker: true,
        emailEvents: {
          orderBy: { occurredAt: "desc" },
          take: 3,
        },
        formSubmissions: {
          orderBy: { submittedAt: "desc" },
          take: 1,
        },
      },
      orderBy: [{ updatedAt: "desc" }],
      take: filters.take,
      skip: filters.skip,
    }),
    prisma.removalRequest.count({ where }),
  ]);

  return { requests, total };
}

export async function listAuditLogs(filters) {
  const where = {
    ...(filters.action ? { action: filters.action } : {}),
    ...(filters.actorUserId ? { actorUserId: filters.actorUserId } : {}),
    ...(filters.targetType ? { targetType: filters.targetType } : {}),
    ...(filters.targetId ? { targetId: filters.targetId } : {}),
  };

  const [auditLogs, total] = await Promise.all([
    prisma.auditLog.findMany({
      where,
      include: {
        actor: {
          select: {
            id: true,
            email: true,
            displayName: true,
            role: true,
          },
        },
      },
      orderBy: { createdAt: "desc" },
      take: filters.take,
      skip: filters.skip,
    }),
    prisma.auditLog.count({ where }),
  ]);

  return { auditLogs, total };
}

export async function getAdminRequest(requestId) {
  const request = await prisma.removalRequest.findUnique({
    where: { id: requestId },
    include: {
      user: {
        select: {
          id: true,
          email: true,
          displayName: true,
          profile: true,
        },
      },
      broker: true,
      emailEvents: {
        orderBy: { occurredAt: "desc" },
      },
      formSubmissions: {
        orderBy: { submittedAt: "desc" },
        include: {
          submittedBy: {
            select: {
              id: true,
              email: true,
              displayName: true,
            },
          },
        },
      },
    },
  });

  if (!request) {
    throw new AppError("Removal request not found", 404, "REQUEST_NOT_FOUND");
  }

  return request;
}

function statusTimestampPatch(status) {
  const now = new Date();

  switch (status) {
    case "EMAIL_SENT":
      return { emailSentAt: now, submittedAt: now };
    case "FORM_SUBMITTED":
      return { formSubmittedAt: now, submittedAt: now };
    case "COMPLETED":
      return { completedAt: now, responseAt: now };
    case "REJECTED":
      return { responseAt: now };
    default:
      return {};
  }
}

export async function updateAdminRequest(requestId, input, adminUser) {
  const updateData = {
    status: input.status,
    notes: input.notes,
    failureReason: input.failureReason,
    ...statusTimestampPatch(input.status),
  };

  if (Object.hasOwn(input, "nextFollowupAt")) {
    updateData.nextFollowupAt = input.nextFollowupAt ? new Date(input.nextFollowupAt) : null;
  }

  try {
    await prisma.$transaction(async (tx) => {
      await tx.removalRequest.update({
        where: { id: requestId },
        data: updateData,
      });

      await tx.emailEvent.create({
        data: {
          removalRequestId: requestId,
          type: input.status === "FAILED" ? "FAILED" : "RECEIVED",
          provider: "operator",
          metadata: {
            action: "status_update",
            status: input.status,
            adminUserId: adminUser.id,
            adminEmail: adminUser.email,
          },
        },
      });
    });

    return await getAdminRequest(requestId);
  } catch (error) {
    if (error.code === "P2025") {
      throw new AppError("Removal request not found", 404, "REQUEST_NOT_FOUND");
    }

    throw error;
  }
}

export async function appendAdminRequestNote(requestId, note, adminUser) {
  const request = await getAdminRequest(requestId);
  const timestamp = new Date().toISOString();
  const entry = `[${timestamp}] ${adminUser.email}: ${note}`;
  const notes = request.notes ? `${request.notes}\n${entry}` : entry;

  return prisma.removalRequest.update({
    where: { id: requestId },
    data: { notes },
  });
}

export async function createFormSubmission(requestId, input, adminUser) {
  const request = await getAdminRequest(requestId);
  const brokerSupportsForms =
    request.broker.removalMethod === "FORM" ||
    request.broker.removalMethod === "EMAIL_AND_FORM" ||
    Boolean(request.broker.removalFormUrl) ||
    Boolean(input.targetUrl);

  if (!brokerSupportsForms) {
    throw new AppError("This broker does not have a form workflow configured", 400, "FORM_WORKFLOW_NOT_CONFIGURED");
  }

  const submittedAt = input.submittedAt ? new Date(input.submittedAt) : new Date();
  const nextFollowupAt = input.nextFollowupAt ? new Date(input.nextFollowupAt) : null;

  await prisma.$transaction(async (tx) => {
    await tx.removalRequest.update({
      where: { id: requestId },
      data: {
        status: "FORM_SUBMITTED",
        submittedAt,
        formSubmittedAt: submittedAt,
        nextFollowupAt,
      },
    });

    await tx.formSubmission.create({
      data: {
        removalRequestId: requestId,
        submittedById: adminUser.id,
        targetUrl: input.targetUrl || request.broker.removalFormUrl || null,
        confirmationCode: input.confirmationCode || null,
        evidenceUrl: input.evidenceUrl || null,
        notes: input.notes || null,
        submittedAt,
        nextFollowupAt,
      },
    });

    await tx.emailEvent.create({
      data: {
        removalRequestId: requestId,
        type: "RECEIVED",
        provider: "operator",
        metadata: {
          action: "form_submission",
          adminUserId: adminUser.id,
          adminEmail: adminUser.email,
          targetUrl: input.targetUrl || request.broker.removalFormUrl || null,
          confirmationCode: input.confirmationCode || null,
          evidenceUrl: input.evidenceUrl || null,
        },
        occurredAt: submittedAt,
      },
    });
  });

  return getAdminRequest(requestId);
}
