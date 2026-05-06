import express from "express";
import { asyncHandler } from "../middleware/asyncHandler.js";
import { requireAuth } from "../middleware/auth.js";
import { validate } from "../middleware/validate.js";
import {
  loginSchema,
  signupCompleteSchema,
  signupStartSchema,
  signupVerifySchema,
  updateProfileSchema,
} from "../schemas/authSchemas.js";
import { recordAuditLog } from "../services/auditService.js";
import {
  completeSignup,
  getCurrentUser,
  loginUser,
  startSignup,
  updateUserProfile,
  verifySignupEmail,
} from "../services/authService.js";

const router = express.Router();

router.post(
  "/signup/start",
  validate(signupStartSchema),
  asyncHandler(async (req, res) => {
    const result = await startSignup(req.validated.body);
    await recordAuditLog({
      req,
      action: "SIGNUP_VERIFICATION_STARTED",
      targetType: "PendingSignup",
      targetId: result.pendingSignupId,
      metadata: {
        email: result.email,
        emailDeliverySkipped: result.emailDelivery.skipped,
      },
    });
    res.status(202).json(result);
  }),
);

router.post(
  "/signup/verify",
  validate(signupVerifySchema),
  asyncHandler(async (req, res) => {
    const result = await verifySignupEmail(req.validated.body);
    await recordAuditLog({
      req,
      action: "SIGNUP_EMAIL_VERIFIED",
      targetType: "PendingSignup",
      targetId: result.pendingSignupId,
      metadata: { email: result.email },
    });
    res.json(result);
  }),
);

router.post(
  "/signup/complete",
  validate(signupCompleteSchema),
  asyncHandler(async (req, res) => {
    const result = await completeSignup(req.validated.body, {
      ipAddress: req.ip,
      userAgent: req.get("user-agent"),
    });
    await recordAuditLog({
      req,
      actorUser: result.user,
      action: "USER_REGISTERED",
      targetType: "User",
      targetId: result.user.id,
      metadata: {
        email: result.user.email,
        flow: "verified_signup",
      },
    });
    await recordAuditLog({
      req,
      actorUser: result.user,
      action: "REMOVAL_AUTHORIZATION_ACCEPTED",
      targetType: "User",
      targetId: result.user.id,
      metadata: {
        consentVersion: req.validated.body.consent.consentVersion,
        hasElectronicSignature: Boolean(req.validated.body.consent.electronicSignature),
      },
    });
    res.status(201).json(result);
  }),
);

router.post(
  "/register",
  (_req, res) => {
    res.status(410).json({
      error: "Verified signup is required. Use /api/auth/signup/start, /api/auth/signup/verify, and /api/auth/signup/complete.",
      code: "VERIFIED_SIGNUP_REQUIRED",
    });
  },
);

router.post(
  "/login",
  validate(loginSchema),
  asyncHandler(async (req, res) => {
    try {
      const result = await loginUser(req.validated.body.email, req.validated.body.password);
      await recordAuditLog({
        req,
        actorUser: result.user,
        action: "LOGIN_SUCCEEDED",
        targetType: "User",
        targetId: result.user.id,
        metadata: { email: result.user.email },
      });
      res.json(result);
    } catch (error) {
      await recordAuditLog({
        req,
        action: "LOGIN_FAILED",
        targetType: "User",
        metadata: {
          email: req.validated.body.email.trim().toLowerCase(),
          code: error.code,
        },
      });
      throw error;
    }
  }),
);

router.get(
  "/me",
  requireAuth,
  asyncHandler(async (req, res) => {
    const user = await getCurrentUser(req.user.id);
    res.json({ user });
  }),
);

router.patch(
  "/profile",
  requireAuth,
  validate(updateProfileSchema),
  asyncHandler(async (req, res) => {
    const profile = await updateUserProfile(req.user.id, req.validated.body);
    const user = await getCurrentUser(req.user.id);
    await recordAuditLog({
      req,
      action: "PROFILE_UPDATED",
      targetType: "Profile",
      targetId: profile.id,
      metadata: {
        userId: user.id,
        hasPhone: Boolean(profile.phone),
        hasAddress: Boolean(profile.address),
        country: profile.country,
      },
    });
    res.json({ profile, user });
  }),
);

export default router;
