import { z } from "zod";

const optionalUrl = z
  .string()
  .trim()
  .url()
  .or(z.literal(""))
  .optional()
  .transform((value) => value || undefined);

const optionalEmail = z
  .string()
  .trim()
  .email()
  .or(z.literal(""))
  .optional()
  .transform((value) => value || undefined);

const optionalPositiveInt = z
  .union([z.coerce.number().int().min(1).max(365), z.literal(""), z.undefined()])
  .transform((value) => (value === "" ? undefined : value));

const requiredDataSchema = z
  .array(z.string().trim().min(1).max(120))
  .max(30)
  .optional()
  .default([]);

export const adminListSchema = z.object({
  query: z.object({
    q: z.string().trim().max(120).optional(),
    status: z.enum(["ACTIVE", "PAUSED", "RETIRED"]).optional(),
    country: z.string().trim().max(120).optional(),
    removalMethod: z.enum(["EMAIL", "FORM", "EMAIL_AND_FORM"]).optional(),
    riskLevel: z.enum(["UNKNOWN", "LOW", "MEDIUM", "HIGH"]).optional(),
    take: z.coerce.number().int().min(1).max(100).optional().default(50),
    skip: z.coerce.number().int().min(0).optional().default(0),
  }),
});

export const createBrokerSchema = z.object({
  body: z.object({
    name: z.string().trim().min(2).max(160),
    legalName: z.string().trim().max(200).optional().default(""),
    email: optionalEmail,
    privacyEmail: optionalEmail,
    escalationEmail: optionalEmail,
    website: optionalUrl,
    removalFormUrl: optionalUrl,
    country: z.string().trim().min(2).max(120),
    region: z.string().trim().max(120).optional().default(""),
    category: z.string().trim().max(120).optional().default(""),
    removalMethod: z.enum(["EMAIL", "FORM", "EMAIL_AND_FORM"]).default("EMAIL"),
    expectedResponseDays: optionalPositiveInt,
    removalInstructions: z.string().trim().max(4000).optional().default(""),
    requiredData: requiredDataSchema,
    riskLevel: z.enum(["UNKNOWN", "LOW", "MEDIUM", "HIGH"]).default("UNKNOWN"),
    status: z.enum(["ACTIVE", "PAUSED", "RETIRED"]).default("ACTIVE"),
  }),
});

export const updateBrokerSchema = z.object({
  params: z.object({
    brokerId: z.string().uuid(),
  }),
  body: createBrokerSchema.shape.body.partial(),
});

export const adminRequestListSchema = z.object({
  query: z.object({
    q: z.string().trim().max(120).optional(),
    status: z.string().trim().max(40).optional(),
    brokerId: z.string().uuid().optional(),
    userId: z.string().uuid().optional(),
    take: z.coerce.number().int().min(1).max(100).optional().default(50),
    skip: z.coerce.number().int().min(0).optional().default(0),
  }),
});

export const adminAuditLogListSchema = z.object({
  query: z.object({
    action: z.string().trim().max(120).optional(),
    actorUserId: z.string().uuid().optional(),
    targetType: z.string().trim().max(80).optional(),
    targetId: z.string().trim().max(120).optional(),
    take: z.coerce.number().int().min(1).max(100).optional().default(50),
    skip: z.coerce.number().int().min(0).optional().default(0),
  }),
});

export const requestIdSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
});

export const updateRequestSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
  body: z.object({
    status: z.enum([
      "DRAFT",
      "QUEUED",
      "EMAIL_SENT",
      "FORM_REQUIRED",
      "FORM_SUBMITTED",
      "IN_PROGRESS",
      "COMPLETED",
      "REJECTED",
      "FAILED",
      "NEEDS_USER_INFO",
    ]),
    notes: z.string().trim().max(2000).optional(),
    failureReason: z.string().trim().max(1000).optional(),
    nextFollowupAt: z.string().datetime().or(z.literal("")).optional(),
  }),
});

export const appendRequestNoteSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
  body: z.object({
    note: z.string().trim().min(1).max(1000),
  }),
});

export const createFormSubmissionSchema = z.object({
  params: z.object({
    requestId: z.string().uuid(),
  }),
  body: z.object({
    targetUrl: optionalUrl,
    confirmationCode: z.string().trim().max(160).optional().default(""),
    evidenceUrl: optionalUrl,
    notes: z.string().trim().max(2000).optional().default(""),
    submittedAt: z.string().datetime().optional(),
    nextFollowupAt: z.string().datetime().or(z.literal("")).optional(),
  }),
});
