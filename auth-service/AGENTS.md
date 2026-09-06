# Auth Service — AGENTS.md

Scope
- Repository section: microservices/auth-service/
- Purpose: guidance for agents and developers modifying or inspecting the Auth Service.
- Follow the most specific AGENTS.md applicable. Also consult `microservices/AGENTS.md` for backend-wide conventions.

Quick summary
- Purpose: user authentication and profile management (signup, signin, OTP/account verification, password reset, social Google auth).
- Tech: Node.js + TypeScript, Express 5, Mongoose (MongoDB), ioredis (Redis), bcrypt, JWT, Winston logging.
- Entry point: `src/index.ts` — connects to MongoDB, initializes Express app, sets up middleware and routes.

Important files
- Entry & bootstrap
  - src/index.ts
  - src/configs/express.config.ts
  - src/configs/db.config.ts
  - src/configs/redis.config.ts
  - src/configs/env.config.ts
  - src/configs/winston.config.ts

- Routes
  - src/routes/user.route.ts — public + protected user endpoints
  - src/routes/social-auth.route.ts — Google social auth routes

- Controllers
  - src/controllers/user.controller.ts
  - src/controllers/social-auth.controller.ts

- Models
  - src/models/user.model.ts — Mongoose schema, password hashing (bcrypt + pepper), comparePassword method

- Middlewares & helpers
  - src/middlewares/gateway-auth.middleware.ts — validates gateway HMAC signature (x-user / x-user-signature)
  - src/middlewares/validator.middleware.ts — Joi validation wrapper
  - src/middlewares/crypto.middleware.ts — verifies crypto tokens (OTP/reset) via Redis
  - src/middlewares/error-handler.middleware.ts — syntax & error handling
  - src/helpers/* — cookie, crypto, jwt, response, common utilities

- Integrations
  - src/services/email.service.ts — invokes Email Service (HTTP POST) to send OTP/reset emails
  - src/message-brokers/producer.message-broker.ts — RabbitMQ producer code exists but is commented out (not in active use)

Routes overview (high-level)
- Public (no gateway header required)
  - POST /user/public/signin
  - POST /user/public/signup
  - PATCH /user/public/verify-account
  - POST /user/public/forgot-password
  - POST /user/public/verify-otp
  - PATCH /user/public/reset-password
  - GET /user/public/resend-otp
  - POST /auth/google (social auth route — check social-auth.route)

- Protected (gateway must sign x-user header)
  - GET /user/me
  - GET /user/:id
  - GET /user/usersData?ids=1,2,3
  - GET /user/ (search)
  - POST /user/:id (update)
  - POST /user/signout

Authentication & inter-service contract
- Clients call API Gateway which validates JWT and injects two headers into proxied requests:
  - x-user: JSON payload from JWT
  - x-user-signature: HMAC-SHA256 signature of the payload using GATEWAY_SECRET
- Auth Service must validate the gateway signature using GATEWAY_SECRET (see gateway-auth.middleware.ts)
- Do not accept requests that lack these headers for protected endpoints.

Environment variables (development & production)
- Required (from src/configs/env.config.ts):
  - ENV, PORT
  - MONGO_URI
  - EMAIL_SERVICE (URL for calling Email Service)
  - RABBIT_MQ_URI (present but broker code is commented out)
  - PASSWORD_PEPPER
  - PASSWORD_SALT_WORK_FACTOR
  - JWT_AUTH_SECRET
  - REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
  - COOKIE_KEYS (JSON with jwt_token, crypto_token, otp_verified)
  - REDIS_KEY_PREFIX (JSON with account_verfication, reset_password)
  - GATEWAY_SECRET
  - BYPASS_VERIFICATION (optional boolean for local testing)

Dev & maintenance commands
- From microservices/auth-service/:
  - npm run dev — starts nodemon src/index.ts (development)
  - npm run build — tsc compile
  - npm run start — node build/index.js
  - npm run lint — eslint on src

Data & persistence
- MongoDB (users collection): models live in src/models. Use Mongoose methods and ensure correct projections (controllers call .select to remove password, __v).
- Redis: used to store OTP/crypto tokens (see src/configs/redis.config.ts). Do not clear Redis keys indiscriminately in shared dev/staging environments.

Security & safety guidance (must follow)
- Never log or commit secret values (JWT secrets, Redis passwords, COOKIE_KEYS, PASSWORD_PEPPER). Treat .env.local and runtime env as secret.
- Do not change COOKIE_KEYS names without coordinating frontend and gateway; these are used across services and the Next.js frontend.
- When adding new protected endpoints, ensure gateway signature validation is applied and `gateway-auth.middleware` is used where appropriate.
- Avoid modifying password hashing parameters (salt rounds, pepper) without a migration plan; existing passwords depend on current pepper and salt work factor.
- When changing any auth or token handling behavior, document the change in this AGENTS.md and notify frontend and gateway owners.

Testing & verification
- There are no automated unit/integration tests configured — add tests alongside controllers/services where necessary.
- Manual verification steps for auth flows:
  1. Start services (api-gateway, auth-service, chat-service) with microservices npm run dev from microservices/ root.
  2. Use Postman or curl to call public endpoints: signup -> verify-account (OTP flow) -> signin.
  3. Verify that cookies are set (check cookie names from COOKIE_KEYS) and protected endpoints return expected data.

Where to look to implement common tasks
- Add a new user-related endpoint: implement controller -> route file -> add route in src/configs/express.config.ts -> ensure validator middleware added if needed -> update any docs if provided.
- Investigate OTP flows: src/middlewares/crypto.middleware.ts and src/configs/redis.config.ts
- Email templates & calls: Auth Service calls the Email Service URL; changes to email sending require coordinating with microservices/email-service.

Prohibited or high-risk operations (without human approval)
- Dropping or truncating production databases
- Changing GATEWAY_SECRET, COOKIE_KEYS, or JWT_AUTH_SECRET in a way that invalidates existing tokens without an explicit migration strategy
- Exposing secrets in logs, stack traces, or committed files
- Running or enabling RabbitMQ code in production unless the infrastructure is provisioned and tested

Notes & assumptions
- RabbitMQ exists in the codebase but is intentionally disabled; current flow uses synchronous HTTP call from Auth -> Email Service.
- BYPASS_VERIFICATION exists for tests/local development; treat it as insecure for staging/production.

Cross-references
- microservices/AGENTS.md — backend-level conventions and rules
- chatting-frontend/AGENTS.md — (to be created) frontend guidance and cookie/redirect behaviors

If you want, next action options:
- Create `microservices/auth-service/AGENTS.md` (done)
- Create `microservices/chat-service/AGENTS.md` next (recommended for real-time details)
- Create `.kilo` agents and skills files to automate safe exploration and commands (after AGENTS.md files are in place)

