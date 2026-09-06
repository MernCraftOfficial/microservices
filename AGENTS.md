# Microservices — AGENTS.md

Scope
- Repository section: microservices/
- Purpose: concise guidance for backend agents working across the microservices surface (API Gateway, Auth Service, Chat Service, Email Service).
- Follow the most specific AGENTS.md available (service-level AGENTS.md overrides these instructions).

Quick summary
- Architecture: multiple TypeScript Express services (API Gateway, Auth Service, Chat Service, Email Service).
- Runtime: Node.js + TypeScript. Each service builds with `tsc` and runs in dev with `nodemon src/index.ts`.
- Datastore: MongoDB (Mongoose) used by Auth and Chat services.
- Cache/session: Redis (ioredis) used for OTP and ephemeral keys.
- Real-time: Chat Service exposes a Socket.IO namespace (/uchat) and manages rooms per user id.
- Inter-service communication: API Gateway proxies client requests to services; Gateway verifies JWT and forwards user payload via HMAC signature (x-user / x-user-signature). Chat Service calls Auth Service internally for user data. Auth Service invokes Email Service via HTTP.
- Message broker (RabbitMQ) code exists but is commented out — not used in the current implementation.

Services (high-level)
- api-gateway/
  - Purpose: single entrypoint, CORS, JWT verification, proxying to downstream services, serves API docs.
  - Key behavior: verifies JWT (from Authorization header or cookies), sets x-user and x-user-signature, proxies /api/user -> Auth Service and /api/chat -> Chat Service.

- auth-service/
  - Purpose: user auth, profile management, OTP flows, social auth (Google), account verification, password reset.
  - DB: users collection (Mongoose User model).
  - Cache: Redis for OTP / crypto tokens.
  - Important routes: /user/public/* (signup/signin/verify/reset), protected routes under /user/ (me, search, signout).
  - Notes: Passwords hashed with bcrypt + pepper; environment-controlled BYPASS_VERIFICATION exists for local testing.

- chat-service/
  - Purpose: messages, user relations, real-time chat via Socket.IO.
  - DB: messages, user relations, groups (Mongoose models).
  - Socket: Socket.IO namespace /uchat (rooms per user), Socket auth middleware expects JWT in query or cookies.
  - Routes: /chat/* (message CRUD, mark received/read, user relations endpoints).
  - Internal calls: calls AUTH_SERVICE to fetch user details when needed.

- email-service/
  - Purpose: send transactional emails (account verification OTP, reset password) using Resend/Nodemailer and Handlebars templates.
  - Exposes: POST /send endpoint used by Auth Service.

Environment & configuration
- Each service loads env from a local `.env.local` file during development (configs use dotenv with that path).
- Critical environment variables (per-service): PORT, MONGO_URI, REDIS_HOST/PORT/PASSWORD, JWT_AUTH_SECRET, GATEWAY_SECRET, COOKIE_KEYS, REDIS_KEY_PREFIX, PASSWORD_PEPPER, PASSWORD_SALT_WORK_FACTOR, AUTH_SERVICE/CHAT_SERVICE URLs, EMAIL_* (Resend key or SMTP creds), ALLOWED_ORIGINS.
- Do not commit secrets. Only inspect `.env.example` or `.env.sample` templates.

Routing & security
- Clients talk to API Gateway. Gateway authenticates JWT, then injects signed user payload into downstream requests using x-user and x-user-signature (HMAC using GATEWAY_SECRET). Downstream services must validate that signature.
- Socket.IO connections are direct to the Chat Service namespace; ensure allowed origins and token validation are respected.

Databases & stateful services
- MongoDB: look at each service's `src/configs/db.config.ts` for connection behavior. Do not run destructive DB commands without explicit approval.
- Redis: used for temporary tokens and ephemeral data. See `src/configs/redis.config.ts` per service.

Operational notes
- Dev start (local): from `microservices/` root run `npm run dev` (uses concurrently to start api-gateway, auth-service, chat-service). Services also have `npm run dev` individually.
- Build: `npm run build` inside each service (runs `tsc`).
- Tests: no automated test runner configured in these packages.

What agents should NOT do
- Do not expose or print secret values from `.env.local` or runtime environment.
- Do not run destructive commands (DROP DATABASE, rm -rf important folders, production deploy commands) without explicit human approval.
- Do not assume RabbitMQ is available — broker code is present but commented out.

Where to look next (service-specific)
- For service internals (routes, controllers, models), open:
  - `microservices/api-gateway/src/`
  - `microservices/auth-service/src/`
  - `microservices/chat-service/src/`
  - `microservices/email-service/src/`

Service-specific AGENTS.md files should be created inside each service directory (e.g., `microservices/auth-service/AGENTS.md`) and should document entry points, important routes, environment variables, and any cautionary notes specific to that service.

If you want, next step is to create service-level AGENTS.md files (one at a time). Recommend starting with `microservices/AGENTS.md` (this file) followed by `microservices/auth-service/AGENTS.md` (auth is security-sensitive). Ask to proceed before creating service-specific AGENTS.md files.