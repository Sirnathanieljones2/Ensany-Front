import express from "express";
import { z } from "zod";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import { recordAuditLog } from "../services/auditService.js";
import { getDashboard, getUserRequests, startRemoval } from "../services/removalService.js";

const router = express.Router();

const legacyStartSchema = z.object({
  params: z.object({
    userId: z.string().uuid(),
  }),
});

router.post(
  "/removals/start",
  requireAuth,
  asyncHandler(async (req, res) => {
    const result = await startRemoval(req.user.id);
    await recordAuditLog({
      req,
      action: "REMOVAL_RUN_STARTED",
      targetType: "User",
      targetId: req.user.id,
      metadata: {
        totalBrokers: result.totalBrokers,
        results: result.results.map((item) => ({
          requestId: item.requestId,
          broker: item.broker,
          status: item.status,
        })),
      },
    });
    res.status(202).json({ message: "Removal process started", ...result });
  }),
);

router.get(
  "/removals",
  requireAuth,
  asyncHandler(async (req, res) => {
    const requests = await getUserRequests(req.user.id);
    res.json({ requests });
  }),
);

router.get(
  "/dashboard",
  requireAuth,
  asyncHandler(async (req, res) => {
    const dashboard = await getDashboard(req.user.id);
    res.json(dashboard);
  }),
);

router.post(
  "/start-removal/:userId",
  validate(legacyStartSchema),
  asyncHandler(async (req, res) => {
    const result = await startRemoval(req.validated.params.userId);
    await recordAuditLog({
      req,
      action: "LEGACY_REMOVAL_RUN_STARTED",
      targetType: "User",
      targetId: req.validated.params.userId,
      metadata: { totalBrokers: result.totalBrokers },
    });
    res.status(202).json({ message: "Removal process started", ...result });
  }),
);

export default router;
