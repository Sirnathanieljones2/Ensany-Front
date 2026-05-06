import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { recordAuditLog } from "../services/auditService.js";
import { processResendWebhook, verifyResendWebhook } from "../services/resendWebhookService.js";

const router = express.Router();

router.post(
  "/",
  asyncHandler(async (req, res) => {
    const payload = Buffer.isBuffer(req.body) ? req.body.toString("utf8") : String(req.body ?? "");
    const providerEventId = req.get("svix-id");

    const event = verifyResendWebhook(payload, {
      id: providerEventId,
      timestamp: req.get("svix-timestamp"),
      signature: req.get("svix-signature"),
    });

    const result = await processResendWebhook(event, providerEventId);
    await recordAuditLog({
      req,
      action: result.processed ? "RESEND_WEBHOOK_PROCESSED" : "RESEND_WEBHOOK_IGNORED",
      targetType: result.removalRequestId ? "RemovalRequest" : "Webhook",
      targetId: result.removalRequestId,
      metadata: {
        providerEventId,
        eventType: event.type,
        mappedEventType: result.eventType,
        duplicate: result.duplicate,
        ignored: result.ignored,
        reason: result.reason,
      },
    });

    res.json({
      received: true,
      ...result,
    });
  }),
);

export default router;
