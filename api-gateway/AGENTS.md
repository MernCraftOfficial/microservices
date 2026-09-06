# API Gateway — AGENTS.md

Scope
- Repository section: microservices/api-gateway/
- Purpose: guidance for agents and developers modifying or inspecting the API Gateway service.
- Consult `microservices/AGENTS.md` for backend-wide conventions and service-level AGENTS.md files for other services.

Quick summary
- Purpose: single HTTP entry point for clients; enforces CORS policies; validates JWTs; injects a signed user payload into proxied requests; proxies client requests to downstream services (Auth Service and Chat Service); serves API docs.
- Tech: Node.js + TypeScript, Express 5, http-proxy-middleware, JWT verification, Winston logging.
- Entry point: `src/index.ts` — initializes Express app, middleware, and routes.

Important files
- src/index.ts — bootstrap
- src/configs/express.config.ts — middleware registration, CORS, proxy rules, route mounting
- src/middlewares/jwt.middleware.ts — verifies JWT and sets x-user and x-user-signature
- src/routes/docs.route.ts — serves API docs (Scalar/Swagger)
- src/configs/env.config.ts — required environment variables
- src/helpers/* — common helpers (cookie, crypto, response)

Behavior and contract
- JWT handling: Gateway extracts a JWT from the Authorization header or cookies (cookie key from COOKIE_KEYS), verifies it using JWT_AUTH_SECRET, then creates two headers when proxying:
  - x-user: JSON string of the verified JWT payload
  - x-user-signature: HMAC-SHA256 signature of x-user using GATEWAY_SECRET
- Downstream services (Auth, Chat) must verify that signature for protected endpoints (gateway-auth middleware on services).
- Proxy rules (see src/configs/express.config.ts):
  - /api/user -> Auth Service (path rewrites to /user...)
  - /api/chat -> Chat Service (path rewrite ensures /chat/* destination)
- Gateway exposes /docs endpoint for static/dynamic API documentation.

CORS & security
- Allowed origins configured via ALLOWED_ORIGINS environment variable; Gateway also allows *.vercel.app origins by design.
- Gateway sets credentials: true for CORS so cookies (HttpOnly JWT cookies) can be transmitted.
- Do NOT relax CORS origin checks without a security review.

Environment variables (development & production)
- Required/used by gateway (src/configs/env.config.ts):
  - PORT
  - AUTH_SERVICE (URL)
  - CHAT_SERVICE (URL)
  - JWT_AUTH_SECRET
  - GATEWAY_SECRET
  - COOKIE_KEYS (JSON with jwt_token, crypto_token, otp_verified)
  - ALLOWED_ORIGINS
  - Other logging/settings as applicable

Routes to review when making changes
- /docs (documentation UI)
- /api/user/* -> proxied to AUTH_SERVICE
- /api/chat/* -> proxied to CHAT_SERVICE

Dev & maintenance commands
- From microservices/api-gateway/:
  - npm run dev — nodemon src/index.ts (development)
  - npm run build — tsc
  - npm run start — node build/index.js
  - npm run lint — eslint
- From microservices/ root: npm run dev starts gateway with other services concurrently.

Safety & operational guidance (must follow)
- Do not expose JWT_AUTH_SECRET or GATEWAY_SECRET in logs or code. Treat .env.local as secret.
- When adding or changing proxy routes, validate pathRewrite logic carefully to avoid unintentionally forwarding tokens to external hosts.
- When changing how headers (x-user/x-user-signature) are computed or injected, coordinate with downstream services and update their gateway-auth.middleware accordingly.
- Avoid adding public endpoints that bypass authentication unless they are explicitly intended to be public and well-documented.

Testing & verification
- Manual verification steps for proxied endpoints:
  1. Start gateway + downstream services locally (microservices npm run dev).
  2. Sign in via Auth Service (frontend or curl) and obtain cookie or Authorization token.
  3. Call a proxied protected endpoint (e.g., /api/user/me). Gateway should forward x-user and x-user-signature and receive a response from Auth Service.
  4. Check gateway logs and downstream logs to confirm headers and signature verification.

Prohibited/high-risk operations (without human approval)
- Changing GATEWAY_SECRET or JWT signing behavior without a migration plan.
- Disabling JWT verification or signature injection on the gateway in production.
- Allowing arbitrary origins in CORS config.

Notes & assumptions
- Gateway trusts JWT verification using JWT_AUTH_SECRET; the downstream services rely on the gateway to forward the signed user payload.
- Gateway uses http-proxy-middleware; be cautious when adding custom proxy options that may forward additional headers or cookies.

Cross-references
- microservices/AGENTS.md
- microservices/auth-service/AGENTS.md
- microservices/chat-service/AGENTS.md

Next recommended actions
- Ensure API docs are up-to-date in src/routes/docs.route.ts
- If you modify authentication headers or cookie names, update chatting-frontend accordingly
