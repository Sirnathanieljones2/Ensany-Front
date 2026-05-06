import crypto from "node:crypto";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { prisma } from "../lib/prisma.js";
import { env } from "../config/env.js";
import { sendSignupVerificationEmail } from "../email/emailService.js";
import { AppError } from "../utils/errors.js";

const SALT_ROUNDS = 12;
const SIGNUP_CODE_TTL_MINUTES = 20;
const MAX_VERIFICATION_ATTEMPTS = 5;

export const REMOVAL_AUTHORIZATION_CONSENT_TEXT =
  "I authorize Ensany to prepare, submit, track, and follow up on personal data removal, deletion, opt-out, and privacy requests on my behalf using the information I provide.";

function publicUser(user) {
  return {
    id: user.id,
    email: user.email,
    displayName: user.displayName,
    role: user.role,
    profile: user.profile ?? null,
    createdAt: user.createdAt,
  };
}

export function signAuthToken(user) {
  return jwt.sign(
    {
      sub: user.id,
      email: user.email,
      role: user.role,
    },
    env.jwtSecret,
    { expiresIn: "7d" },
  );
}

function hashSecret(value) {
  return crypto.createHash("sha256").update(`${value}:${env.jwtSecret}`).digest("hex");
}

function generateVerificationCode() {
  return String(crypto.randomInt(100000, 1000000));
}

function signupExpiry() {
  const date = new Date();
  date.setMinutes(date.getMinutes() + SIGNUP_CODE_TTL_MINUTES);
  return date;
}

function shouldExposeDevVerificationCode() {
  return env.nodeEnv !== "production";
}

async function assertEmailAvailable(email) {
  const existingUser = await prisma.user.findUnique({
    where: { email },
    select: { id: true },
  });

  if (existingUser) {
    throw new AppError("An account with this email already exists", 409, "EMAIL_EXISTS");
  }
}

function normalizeProfile(input) {
  return {
    fullName: input.fullName.trim(),
    phone: input.phone || null,
    address: input.address || null,
    city: input.city || null,
    country: input.country || null,
    birthYear: input.birthYear || null,
    notes: input.notes || null,
  };
}

export async function startSignup(input) {
  const email = input.email.trim().toLowerCase();
  await assertEmailAvailable(email);

  const code = generateVerificationCode();
  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);
  const pendingSignup = await prisma.pendingSignup.upsert({
    where: { email },
    update: {
      passwordHash,
      displayName: input.displayName.trim(),
      verificationCodeHash: hashSecret(code),
      verificationTokenHash: null,
      verifiedAt: null,
      consumedAt: null,
      expiresAt: signupExpiry(),
      attemptCount: 0,
    },
    create: {
      email,
      passwordHash,
      displayName: input.displayName.trim(),
      verificationCodeHash: hashSecret(code),
      expiresAt: signupExpiry(),
    },
  });

  const emailResult = await sendSignupVerificationEmail({
    email,
    code,
    displayName: input.displayName.trim(),
  });

  return {
    pendingSignupId: pendingSignup.id,
    email,
    expiresAt: pendingSignup.expiresAt,
    emailDelivery: {
      skipped: emailResult.skipped,
      reason: emailResult.reason,
    },
    ...(shouldExposeDevVerificationCode() ? { devVerificationCode: code } : {}),
  };
}

export async function verifySignupEmail(input) {
  const pending = await prisma.pendingSignup.findUnique({
    where: { id: input.pendingSignupId },
  });

  if (!pending || pending.consumedAt) {
    throw new AppError("Signup session not found", 404, "SIGNUP_NOT_FOUND");
  }

  if (pending.expiresAt < new Date()) {
    throw new AppError("Verification code expired. Please start again.", 400, "SIGNUP_CODE_EXPIRED");
  }

  if (pending.attemptCount >= MAX_VERIFICATION_ATTEMPTS) {
    throw new AppError("Too many verification attempts. Please start again.", 429, "SIGNUP_ATTEMPTS_EXCEEDED");
  }

  const codeMatches = pending.verificationCodeHash === hashSecret(input.code);
  if (!codeMatches) {
    await prisma.pendingSignup.update({
      where: { id: pending.id },
      data: { attemptCount: { increment: 1 } },
    });
    throw new AppError("Invalid verification code", 400, "INVALID_SIGNUP_CODE");
  }

  const signupToken = crypto.randomBytes(32).toString("hex");
  await prisma.pendingSignup.update({
    where: { id: pending.id },
    data: {
      verificationTokenHash: hashSecret(signupToken),
      verifiedAt: new Date(),
    },
  });

  return {
    pendingSignupId: pending.id,
    email: pending.email,
    signupToken,
  };
}

export async function completeSignup(input, context = {}) {
  const pending = await prisma.pendingSignup.findUnique({
    where: { id: input.pendingSignupId },
  });

  if (!pending || pending.consumedAt) {
    throw new AppError("Signup session not found", 404, "SIGNUP_NOT_FOUND");
  }

  if (!pending.verifiedAt || pending.verificationTokenHash !== hashSecret(input.signupToken)) {
    throw new AppError("Email verification is required before creating an account", 400, "EMAIL_NOT_VERIFIED");
  }

  if (pending.expiresAt < new Date()) {
    throw new AppError("Signup session expired. Please start again.", 400, "SIGNUP_EXPIRED");
  }

  await assertEmailAvailable(pending.email);

  const profileInput = normalizeProfile(input.profile);
  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: pending.email,
        passwordHash: pending.passwordHash,
        displayName: pending.displayName,
      },
    });

    const profile = await tx.profile.create({
      data: {
        userId: createdUser.id,
        ...profileInput,
      },
    });

    await tx.userAuthorizationConsent.create({
      data: {
        userId: createdUser.id,
        consentVersion: input.consent.consentVersion,
        consentText: REMOVAL_AUTHORIZATION_CONSENT_TEXT,
        removalAuthorization: input.consent.removalAuthorization,
        electronicSignature: input.consent.electronicSignature.trim(),
        ipAddress: context.ipAddress ?? null,
        userAgent: context.userAgent ?? null,
      },
    });

    await tx.pendingSignup.update({
      where: { id: pending.id },
      data: { consumedAt: new Date() },
    });

    return { ...createdUser, profile };
  });

  return {
    user: publicUser(user),
    token: signAuthToken(user),
  };
}

export async function registerUser(input) {
  const normalizedEmail = input.email.trim().toLowerCase();
  await assertEmailAvailable(normalizedEmail);

  const passwordHash = await bcrypt.hash(input.password, SALT_ROUNDS);

  const user = await prisma.$transaction(async (tx) => {
    const createdUser = await tx.user.create({
      data: {
        email: normalizedEmail,
        passwordHash,
        displayName: input.displayName.trim(),
      },
    });

    const profile = await tx.profile.create({
      data: {
        userId: createdUser.id,
        ...normalizeProfile(input.profile),
      },
    });

    return { ...createdUser, profile };
  });

  return {
    user: publicUser(user),
    token: signAuthToken(user),
  };
}

export async function loginUser(email, password) {
  const user = await prisma.user.findUnique({
    where: { email: email.trim().toLowerCase() },
    include: { profile: true },
  });

  if (!user) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  const validPassword = await bcrypt.compare(password, user.passwordHash);

  if (!validPassword) {
    throw new AppError("Invalid email or password", 401, "INVALID_CREDENTIALS");
  }

  return {
    user: publicUser(user),
    token: signAuthToken(user),
  };
}

export async function getCurrentUser(userId) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    include: { profile: true },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  return publicUser(user);
}

export async function updateUserProfile(userId, input) {
  const user = await prisma.user.findUnique({
    where: { id: userId },
    select: { id: true },
  });

  if (!user) {
    throw new AppError("User not found", 404, "USER_NOT_FOUND");
  }

  const profile = await prisma.profile.upsert({
    where: { userId },
    update: {
      fullName: input.fullName.trim(),
      phone: input.phone || null,
      address: input.address || null,
      city: input.city || null,
      country: input.country || null,
      birthYear: input.birthYear || null,
      notes: input.notes || null,
    },
    create: {
      userId,
      fullName: input.fullName.trim(),
      phone: input.phone || null,
      address: input.address || null,
      city: input.city || null,
      country: input.country || null,
      birthYear: input.birthYear || null,
      notes: input.notes || null,
    },
  });

  return profile;
}
