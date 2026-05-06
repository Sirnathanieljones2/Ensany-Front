import { Resend } from "resend";
import { env } from "../config/env.js";

const resend = env.resendApiKey ? new Resend(env.resendApiKey) : null;

function escapeHtml(value) {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function optionalLine(label, value) {
  return value ? `${label}: ${value}` : null;
}

function optionalHtmlLine(label, value) {
  return value ? `<li><strong>${label}:</strong> ${escapeHtml(value)}</li>` : "";
}

export function buildRemovalEmail({ broker, profile, user, trackingUrl }) {
  const subject = `Personal data removal request for ${profile.fullName}`;

  const text = [
    `Hello ${broker.name} privacy team,`,
    "",
    "I am requesting deletion of personal data associated with me under applicable privacy and data protection rights.",
    "",
    `Name: ${profile.fullName}`,
    `Email: ${user.email}`,
    optionalLine("Phone", profile.phone),
    optionalLine("Address", profile.address),
    optionalLine("City", profile.city),
    optionalLine("Country", profile.country),
    optionalLine("Birth year", profile.birthYear),
    "",
    "Please confirm when this request has been completed, or reply with any legally required verification steps.",
    "",
    "Regards,",
    profile.fullName,
  ]
    .filter(Boolean)
    .join("\n");

  const html = `
    <p>Hello ${escapeHtml(broker.name)} privacy team,</p>
    <p>I am requesting deletion of personal data associated with me under applicable privacy and data protection rights.</p>
    <ul>
      <li><strong>Name:</strong> ${escapeHtml(profile.fullName)}</li>
      <li><strong>Email:</strong> ${escapeHtml(user.email)}</li>
      ${optionalHtmlLine("Phone", profile.phone)}
      ${optionalHtmlLine("Address", profile.address)}
      ${optionalHtmlLine("City", profile.city)}
      ${optionalHtmlLine("Country", profile.country)}
      ${optionalHtmlLine("Birth year", profile.birthYear)}
    </ul>
    <p>Please confirm when this request has been completed, or reply with any legally required verification steps.</p>
    <p>Regards,<br>${escapeHtml(profile.fullName)}</p>
    <img src="${trackingUrl}" alt="" width="1" height="1" style="display:none" />
  `;

  return { subject, text, html };
}

export function buildSignupVerificationEmail({ code, displayName }) {
  const subject = "Your Ensany verification code";
  const safeName = displayName || "there";

  const text = [
    `Hello ${safeName},`,
    "",
    "Use this code to verify your email address and continue creating your Ensany account:",
    "",
    code,
    "",
    "This code expires soon. If you did not request an Ensany account, you can ignore this email.",
  ].join("\n");

  const html = `
    <p>Hello ${escapeHtml(safeName)},</p>
    <p>Use this code to verify your email address and continue creating your Ensany account:</p>
    <p style="font-size:28px;letter-spacing:6px;font-weight:800;">${escapeHtml(code)}</p>
    <p>This code expires soon. If you did not request an Ensany account, you can ignore this email.</p>
  `;

  return { subject, text, html };
}

export async function sendSignupVerificationEmail({ email, code, displayName }) {
  const message = buildSignupVerificationEmail({ code, displayName });

  if (env.disableEmailSend || !resend) {
    return {
      skipped: true,
      preview: message,
      reason: "Email sending is disabled or RESEND_API_KEY is missing",
    };
  }

  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to: [email],
    subject: message.subject,
    text: message.text,
    html: message.html,
    tags: [{ name: "category", value: "signup_verification" }],
  });

  if (error) {
    throw new Error(error.message ?? "Resend failed to send signup verification email");
  }

  return {
    skipped: false,
    provider: "resend",
    providerMessageId: data.id,
  };
}

export async function sendRemovalEmail({ broker, profile, request, user }) {
  const recipient = broker.privacyEmail ?? broker.email;

  if (!recipient) {
    return {
      skipped: true,
      reason: "Broker has no email recipient configured",
    };
  }

  const trackingUrl = `${env.appUrl}/api/tracking/email/open/${request.trackingToken}.png`;
  const message = buildRemovalEmail({ broker, profile, request, trackingUrl, user });

  if (env.disableEmailSend || !resend) {
    return {
      skipped: true,
      preview: message,
      reason: "Email sending is disabled or RESEND_API_KEY is missing",
    };
  }

  const { data, error } = await resend.emails.send({
    from: env.emailFrom,
    to: [recipient],
    subject: message.subject,
    text: message.text,
    html: message.html,
    headers: {
      "X-Ensany-Request-Id": request.id,
      "X-Ensany-User-Id": user.id,
    },
    tags: [
      { name: "category", value: "removal_request" },
      { name: "request_id", value: request.id },
      { name: "broker_id", value: broker.id },
    ],
  });

  if (error) {
    throw new Error(error.message ?? "Resend failed to send email");
  }

  return {
    skipped: false,
    provider: "resend",
    providerMessageId: data.id,
  };
}
