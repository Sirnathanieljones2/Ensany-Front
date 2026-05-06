import { z } from "zod";

const profileSchema = z.object({
  fullName: z.string().trim().min(2).max(120),
  phone: z.string().trim().max(40).optional().default(""),
  address: z.string().trim().max(300).optional().default(""),
  city: z.string().trim().max(120).optional().default(""),
  country: z.string().trim().max(120).optional().default(""),
  birthYear: z.coerce.number().int().min(1900).max(new Date().getFullYear()).optional(),
});

const requiredRemovalProfileSchema = profileSchema.extend({
  phone: z.string().trim().min(5).max(40),
  address: z.string().trim().min(5).max(300),
  city: z.string().trim().min(2).max(120),
  country: z.string().trim().min(2).max(120),
  notes: z.string().trim().max(1000).optional().default(""),
});

const consentSchema = z.object({
  removalAuthorization: z.literal(true),
  electronicSignature: z.string().trim().min(2).max(120),
  consentVersion: z.string().trim().min(1).max(40).optional().default("ensany-removal-authorization-v1"),
});

export const signupStartSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(10).max(128),
    displayName: z.string().trim().min(2).max(80),
  }),
});

export const signupVerifySchema = z.object({
  body: z.object({
    pendingSignupId: z.string().uuid(),
    code: z.string().trim().regex(/^\d{6}$/, "Verification code must be 6 digits"),
  }),
});

export const signupCompleteSchema = z.object({
  body: z.object({
    pendingSignupId: z.string().uuid(),
    signupToken: z.string().trim().min(32).max(160),
    consent: consentSchema,
    profile: requiredRemovalProfileSchema,
  }),
});

export const registerSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(10).max(128),
    displayName: z.string().trim().min(2).max(80),
    profile: profileSchema,
  }),
});

export const loginSchema = z.object({
  body: z.object({
    email: z.string().trim().email().max(254),
    password: z.string().min(1).max(128),
  }),
});

export const updateProfileSchema = z.object({
  body: profileSchema.extend({
    notes: z.string().trim().max(1000).optional().default(""),
  }),
});
