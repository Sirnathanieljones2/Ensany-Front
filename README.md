# Ensany Internal README

Ensany is an early-stage data removal platform for the Middle East. The product goal is to help users authorize Ensany to request personal data removal from brokers and data holders on their behalf, then track every request through completion.

This README is for internal development and handoff. It is not public marketing copy.

## Current Stack

- Backend: Node.js, Express 5, Prisma, PostgreSQL on Neon.
- Frontend: React, Vite, React Router.
- Security: Helmet, CORS allowlist, rate limiting, bcrypt password hashing, JWT auth, Zod validation.
- Email: Resend integration with webhook event tracking. Sending can stay disabled locally until the domain is ready.
- Data model: users, profiles, authorization consent, pending signups, brokers, removal requests, email events, form submissions, and audit logs.

## Main Product Areas

- Public site: landing page, about, blog, and pricing pages.
- Auth: login and verified multi-step signup flow.
- Onboarding: user consent and personal information intake before account completion.
- User app: dashboard with request counts, statuses, request table, and empty states.
- Admin app: operator dashboard, broker management, request management, form-required workflows, and audit-backed actions.
- Tracking: Resend webhook events and tracking routes for request/email status history.

## Local Setup

1. Install dependencies:

```bash
npm install
```

2. Create local environment variables:

```bash
cp .env.example .env
```

Then fill in the real local values in `.env`. Never commit `.env`.

3. Apply database migrations:

```bash
npm exec prisma -- migrate deploy
```

4. Generate the Prisma client:

```bash
npm run prisma:generate
```

5. Seed starter brokers and local data:

```bash
npm run prisma:seed
```

6. Run the full local app:

```bash
npm run dev
```

The API runs on `http://localhost:5000` by default. The Vite frontend runs on `http://localhost:5173`.

## Useful Commands

```bash
npm run dev
npm run build
npm run prisma:generate
npm run prisma:seed
npm run test:admin
npm run test:webhook
npm run admin:promote -- user@example.com
```

Use `npm run build` before staging a frontend-heavy change.

## Environment Variables

`.env.example` documents the expected variables:

- `DATABASE_URL`: Neon PostgreSQL connection string.
- `JWT_SECRET`: at least 32 random characters.
- `PORT`: local API port, usually `5000`.
- `CLIENT_ORIGIN`: frontend origin, usually `http://localhost:5173`.
- `APP_URL`: backend origin, usually `http://localhost:5000`.
- `EMAIL_FROM`: sender identity for outbound removal emails.
- `RESEND_API_KEY`: Resend API key.
- `RESEND_WEBHOOK_SECRET`: Resend webhook signing secret.
- `DISABLE_EMAIL_SEND`: set to `true` until a production sender domain is configured.
- `LOG_LEVEL`: local logging level.

Before production, rotate any credentials that were shared locally, use a real sender domain, and verify Resend webhooks against the deployed API URL.

## Git Hygiene

Commit source code, Prisma migrations, scripts, docs, and `.env.example`.

Do not commit:

- `.env` or any real secret file.
- `node_modules/`.
- build output such as `dist/` or `client/dist/`.
- local logs such as `*.log`.
- local database files, uploads, editor settings, or temporary files.

Recommended pre-commit checks:

```bash
git status --short
git check-ignore -v .env .env.example client/dist/index.html node_modules/.bin
npm run build
```

## Suggested First Commit Scope

When you are ready to stage, review the status and then stage the project work deliberately:

```bash
git status --short
git add .gitignore README.md .env.example package.json package-lock.json prisma.config.ts prisma/schema.prisma prisma/migrations/ prisma/seed.js scripts/ server.js src/ client/ docs/ vite.config.js
git status --short
git diff --cached --stat
```

Only commit after confirming no secrets, generated build files, logs, or unrelated local files are staged.

## Current Next Steps

- Keep refining the frontend until the public site and app feel production-grade.
- Add password reset, production email verification, and account recovery.
- Decide on the first paid plan and payment provider.
- Add background jobs for follow-up reminders and scheduled broker retries.
- Add external monitoring, hosted logs, alerting, and error reporting.
- Add stronger automated tests around signup, broker workflows, admin operations, and webhook tracking.
- Configure production deployment, environment separation, and database backup policy.
