import { prisma } from "../src/lib/prisma.js";
import { processResendWebhook } from "../src/services/resendWebhookService.js";

async function main() {
  const request = await prisma.removalRequest.findFirst({
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      status: true,
      providerMessageId: true,
      submittedAt: true,
      emailSentAt: true,
      failureReason: true,
    },
  });

  if (!request) {
    console.log("NO_REQUESTS");
    return;
  }

  const providerMessageId = `email_test_${Date.now()}`;
  const providerEventId = `evt_test_${Date.now()}`;

  await prisma.removalRequest.update({
    where: { id: request.id },
    data: { providerMessageId },
  });

  const event = {
    type: "email.delivered",
    created_at: new Date().toISOString(),
    data: {
      email_id: providerMessageId,
      subject: "Webhook processor test",
      tags: {
        request_id: request.id,
      },
    },
  };

  const first = await processResendWebhook(event, providerEventId);
  const second = await processResendWebhook(event, providerEventId);
  const updated = await prisma.removalRequest.findUnique({
    where: { id: request.id },
    select: {
      status: true,
      providerMessageId: true,
      emailEvents: {
        where: { providerEventId },
        select: {
          type: true,
          provider: true,
          providerEventId: true,
        },
      },
    },
  });

  console.log(JSON.stringify({ first, second, updated }, null, 2));

  await prisma.emailEvent.deleteMany({
    where: { providerEventId },
  });
  await prisma.removalRequest.update({
    where: { id: request.id },
    data: {
      status: request.status,
      providerMessageId: request.providerMessageId,
      submittedAt: request.submittedAt,
      emailSentAt: request.emailSentAt,
      failureReason: request.failureReason,
    },
  });
}

main()
  .catch((error) => {
    console.error(error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
