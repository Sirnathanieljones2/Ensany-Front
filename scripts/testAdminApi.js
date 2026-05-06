import { prisma } from "../src/lib/prisma.js";
import {
  createBroker,
  createFormSubmission,
  getAdminOverview,
  listAuditLogs,
  listAdminBrokers,
  listAdminRequests,
  updateAdminRequest,
} from "../src/services/adminService.js";
import { recordAuditLog } from "../src/services/auditService.js";
import { registerUser } from "../src/services/authService.js";

async function main() {
  const stamp = Date.now();
  const email = `admin-smoke+${stamp}@example.com`;
  const { user } = await registerUser({
    email,
    password: "StrongPassword123!",
    displayName: "Admin Smoke",
    profile: {
      fullName: "Admin Smoke",
      city: "Cairo",
      country: "Egypt",
    },
  });

  const adminUser = await prisma.user.update({
    where: { id: user.id },
    data: { role: "ADMIN" },
    select: { id: true, email: true, role: true },
  });

  const broker = await createBroker({
    name: `Smoke Broker ${stamp}`,
    country: "Egypt",
    region: "Middle East",
    category: "Smoke test",
    privacyEmail: "privacy@example.com",
    removalMethod: "EMAIL",
    status: "PAUSED",
  });

  const overview = await getAdminOverview();
  const brokerList = await listAdminBrokers({ take: 5, skip: 0 });
  await recordAuditLog({
    actorUser: adminUser,
    action: "ADMIN_SMOKE_TEST",
    targetType: "User",
    targetId: adminUser.id,
    metadata: { stamp },
  });
  const auditList = await listAuditLogs({ take: 5, skip: 0, action: "ADMIN_SMOKE_TEST" });
  const auditEvent = auditList.auditLogs.find((entry) => entry.targetId === adminUser.id);

  if (!auditEvent) {
    throw new Error("Audit smoke test failed to create and list an audit event");
  }

  const requestList = await listAdminRequests({ take: 1, skip: 0 });
  const request = requestList.requests[0];
  const originalRequest = request
    ? {
        status: request.status,
        notes: request.notes,
        failureReason: request.failureReason,
        submittedAt: request.submittedAt,
        formSubmittedAt: request.formSubmittedAt,
        nextFollowupAt: request.nextFollowupAt,
      }
    : null;
  const updatedRequest = request
    ? await updateAdminRequest(
        request.id,
        {
          status: "NEEDS_USER_INFO",
          notes: "Admin smoke test note",
        },
        adminUser,
      )
    : null;
  const formSubmission = request
    ? await createFormSubmission(
        request.id,
        {
          targetUrl: "https://example.com/privacy-form",
          confirmationCode: `FORM-${stamp}`,
          notes: "Admin smoke form submission",
        },
        adminUser,
      )
    : null;

  await prisma.broker.delete({ where: { id: broker.id } });
  await prisma.auditLog.deleteMany({
    where: {
      action: "ADMIN_SMOKE_TEST",
      targetId: adminUser.id,
    },
  });
  if (request && originalRequest) {
    await prisma.formSubmission.deleteMany({
      where: {
        removalRequestId: request.id,
        confirmationCode: `FORM-${stamp}`,
      },
    });
    await prisma.emailEvent.deleteMany({
      where: {
        removalRequestId: request.id,
        provider: "operator",
        OR: [
          {
            metadata: {
              path: ["action"],
              equals: "status_update",
            },
          },
          {
            metadata: {
              path: ["action"],
              equals: "form_submission",
            },
          },
        ],
      },
    });
    await prisma.removalRequest.update({
      where: { id: request.id },
      data: originalRequest,
    });
  }
  await prisma.user.delete({ where: { id: adminUser.id } });

  console.log(
    JSON.stringify(
      {
        adminRole: adminUser.role,
        overviewUsers: overview.totalUsers,
        brokerListTotal: brokerList.total,
        createdBroker: broker.name,
        auditEventCreated: Boolean(auditEvent),
        updatedRequestStatus: updatedRequest?.status ?? "NO_REQUESTS",
        formWorkflowStatus: formSubmission?.status ?? "NO_REQUESTS",
      },
      null,
      2,
    ),
  );
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
