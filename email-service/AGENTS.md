# Email Service — AGENTS.md

Scope
- Repository section: microservices/email-service/
- Purpose: guidance for agents and developers working on the Email Service used for transactional emails (account verification OTP, reset password, etc.).
- Consult `microservices/AGENTS.md` and `microservices/auth-service/AGENTS.md` for cross-service behavior.

Quick summary
- Purpose: send transactional emails using Resend and Handlebars templates. Auth Service calls Email Service synchronously to deliver OTP and reset-password emails.
- Tech: Node.js + TypeScript, Express 5, Resend (or nodemailer), Handlebars templates, Winston logging.
- Entry point: `src/index.ts` — initializes Express app and routes.

Important files
- src/index.ts — bootstrap
- src/routes/email.route.ts — POST /send endpoint
- src/controllers/email.controller.ts — validates body and invokes mailer
- src/configs/nodemailer.config.ts — Resend integration & handlebars compilation wrapper (compileHbs)
- src/libs/compile-hbs.lib.ts — compile Handlebars templates to HTML
- templates/ (if present) — Handlebars templates used for account-verification, reset-password, etc.

Contract & request shape
- Auth Service will call POST /send with a JSON body including at least:
  - receiverEmail: string
  - emailTemplate: string (template filename without extension)
  - subject: string
  - context: object (template context, e.g., {name, otp})
- Email Service must validate these parameters and return a success or error response. Keep payload validation strict to avoid injecting unexpected values into templates.

Environment variables (development & production)
- Typical env variables (see src/configs/env.config.ts):
  - PORT
  - EMAIL_FROM
  - EMAIL_USER / EMAIL_PASSWORD or RESEND_API_KEY (the project uses Resend by default)
  - APP_NAME, YEAR (for template context)
  - Other logging/transport config

Dev & maintenance commands
- From microservices/email-service/:
  - npm run dev — nodemon src/index.ts
  - npm run build — tsc
  - npm run start — node build/index.js
  - npm run lint — eslint

Safety & operational guidance (must follow)
- Do not commit or log email provider API keys, SMTP credentials, or other secrets.
- Validate and sanitize template context values before compiling templates to avoid injection of unexpected HTML or scripts.
- When changing templates, ensure fallback text/plain content or a safe HTML template to avoid breaking email clients.
- When adding new templates, update compile-hbs.lib.ts template path resolution and include tests or a local preview mechanism.

Testing & verification
- Manual test flow:
  1. Start email service locally (npm run dev) and call POST /send with a valid template and context.
  2. Inspect response and check the Resend (or SMTP) provider dashboard / logs to verify email delivery.
  3. Use a disposable email or mailtrap-like service for development testing.
- Template preview: if templates exist, compile them locally with sample context to verify output HTML.

Operational & delivery notes
- The project currently uses Resend API via the Resend SDK for sending emails. verify env settings and provider quotas before running in staging/production.
- The Auth Service currently calls Email Service synchronously; message queueing was considered (RabbitMQ code exists) but is commented out. If switching to async delivery, coordinate changes across services and add retry/backoff.

Prohibited/high-risk operations (without human approval)
- Exposing API keys or SMTP credentials in logs, error messages, or committed files.
- Switching the email provider or credentials in production without verifying templates and delivery behavior.
- Sending bulk emails to production lists from development systems.

Notes & assumptions
- compileHbs helper expects templates to exist in the repository. If templates are missing, Email Service builds HTML from context-only or will error — coordinate template changes with Auth Service email context.

Cross-references
- microservices/auth-service/AGENTS.md — caller of this service
- microservices/AGENTS.md

Next recommended actions
- Add a local template preview tool or route for development to render templates with sample context (access restricted to local).
- Add input validation tests for the /send endpoint to avoid invalid template names or missing context keys.
