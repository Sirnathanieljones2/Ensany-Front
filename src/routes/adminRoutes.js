import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAdmin, requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  adminAuditLogListSchema,
  adminListSchema,
  adminRequestListSchema,
  appendRequestNoteSchema,
  createFormSubmissionSchema,
  createBrokerSchema,
  requestIdSchema,
  updateBrokerSchema,
  updateRequestSchema,
} from "../schemas/adminSchemas.js";
import { recordAuditLog } from "../services/auditService.js";
import {
  appendAdminRequestNote,
  createFormSubmission,
  createBroker,
  getAdminOverview,
  getAdminRequest,
  listAuditLogs,
  listAdminBrokers,
  listAdminRequests,
  updateAdminRequest,
  updateBroker,
} from "../services/adminService.js";

const router = express.Router();

router.use(requireAuth, requireAdmin);

router.get(
  "/overview",
  asyncHandler(async (_req, res) => {
    const overview = await getAdminOverview();
    res.json({ overview });
  }),
);

router.get(
  "/brokers",
  validate(adminListSchema),
  asyncHandler(async (req, res) => {
    const result = await listAdminBrokers(req.validated.query);
    res.json(result);
  }),
);

router.post(
  "/brokers",
  validate(createBrokerSchema),
  asyncHandler(async (req, res) => {
    const broker = await createBroker(req.validated.body);
    await recordAuditLog({
      req,
      action: "BROKER_CREATED",
      targetType: "Broker",
      targetId: broker.id,
      metadata: {
        name: broker.name,
        country: broker.country,
        removalMethod: broker.removalMethod,
        status: broker.status,
      },
    });
    res.status(201).json({ broker });
  }),
);

router.patch(
  "/brokers/:brokerId",
  validate(updateBrokerSchema),
  asyncHandler(async (req, res) => {
    const broker = await updateBroker(req.validated.params.brokerId, req.validated.body);
    await recordAuditLog({
      req,
      action: "BROKER_UPDATED",
      targetType: "Broker",
      targetId: broker.id,
      metadata: {
        fields: Object.keys(req.validated.body),
        status: broker.status,
        removalMethod: broker.removalMethod,
      },
    });
    res.json({ broker });
  }),
);

router.get(
  "/requests",
  validate(adminRequestListSchema),
  asyncHandler(async (req, res) => {
    const result = await listAdminRequests(req.validated.query);
    res.json(result);
  }),
);

router.get(
  "/audit-logs",
  validate(adminAuditLogListSchema),
  asyncHandler(async (req, res) => {
    const result = await listAuditLogs(req.validated.query);
    res.json(result);
  }),
);

router.get(
  "/requests/:requestId",
  validate(requestIdSchema),
  asyncHandler(async (req, res) => {
    const request = await getAdminRequest(req.validated.params.requestId);
    res.json({ request });
  }),
);

router.patch(
  "/requests/:requestId",
  validate(updateRequestSchema),
  asyncHandler(async (req, res) => {
    const request = await updateAdminRequest(
      req.validated.params.requestId,
      req.validated.body,
      req.user,
    );
    await recordAuditLog({
      req,
      action: "REMOVAL_REQUEST_UPDATED",
      targetType: "RemovalRequest",
      targetId: request.id,
      metadata: {
        status: request.status,
        brokerId: request.brokerId,
        userId: request.userId,
        fields: Object.keys(req.validated.body),
      },
    });
    res.json({ request });
  }),
);

router.post(
  "/requests/:requestId/notes",
  validate(appendRequestNoteSchema),
  asyncHandler(async (req, res) => {
    const request = await appendAdminRequestNote(
      req.validated.params.requestId,
      req.validated.body.note,
      req.user,
    );
    await recordAuditLog({
      req,
      action: "REMOVAL_REQUEST_NOTE_ADDED",
      targetType: "RemovalRequest",
      targetId: request.id,
      metadata: {
        noteLength: req.validated.body.note.length,
      },
    });
    res.json({ request });
  }),
);

router.post(
  "/requests/:requestId/form-submissions",
  validate(createFormSubmissionSchema),
  asyncHandler(async (req, res) => {
    const request = await createFormSubmission(
      req.validated.params.requestId,
      req.validated.body,
      req.user,
    );
    await recordAuditLog({
      req,
      action: "FORM_SUBMISSION_RECORDED",
      targetType: "RemovalRequest",
      targetId: request.id,
      metadata: {
        brokerId: request.brokerId,
        userId: request.userId,
        status: request.status,
        hasConfirmationCode: Boolean(req.validated.body.confirmationCode),
        hasEvidenceUrl: Boolean(req.validated.body.evidenceUrl),
        nextFollowupAt: req.validated.body.nextFollowupAt,
      },
    });
    res.status(201).json({ request });
  }),
);

export default router;
