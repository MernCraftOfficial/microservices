# Chat Service — AGENTS.md

Scope
- Repository section: microservices/chat-service/
- Purpose: guidance for agents and developers working on the Chat Service (message storage, user relations, real-time Socket.IO).
- Consult `microservices/AGENTS.md` for backend-wide conventions and `microservices/auth-service/AGENTS.md` for auth-specific details.

Quick summary
- Purpose: manage messages, user relations, groups and provide a Socket.IO namespace for real-time chat.
- Tech: Node.js + TypeScript, Express 5, Socket.IO 4.x, Mongoose (MongoDB), ioredis (Redis), Winston logging.
- Entry point: `src/index.ts` — connects to MongoDB, initializes Socket.IO namespace (/uchat), sets up Express routes, and starts HTTP server.

Important files
- Entry & bootstrap
  - src/index.ts
  - src/configs/http.config.ts (creates HTTP server shared between Express and Socket.IO)
  - src/configs/socket.config.ts (creates Socket.IO Server and namespaces)
  - src/configs/db.config.ts
  - src/configs/redis.config.ts
  - src/configs/env.config.ts
  - src/configs/winston.config.ts

- Socket code
  - src/sockets/chat.socket.ts — initializes namespace `/uchat`, registers connection handler and socket events, joins rooms per user
  - src/middlewares/socket.middlware.ts — authenticates sockets (JWT via query or cookie)
  - src/helpers/socket.helper.ts — helper to compute per-user room keys (getChatSocketKey)

- Routes & controllers
  - src/routes/message.route.ts — message CRUD, mark received/read, count by status
  - src/controllers/message.controller.ts
  - src/routes/user-relations.route.ts — friend request & relation endpoints
  - src/controllers/user-relations.controller.ts

- Models & repositories
  - src/models/message.model.ts — message schema, media support, messageStatus (sent/received/read)
  - src/models/user-relations.model.ts — friend and group relations, unread counts, lastMessage
  - src/models/group.model.ts — group schema
  - src/repositories/* — DB access helpers (message.repository.ts, user-relations.repository.ts)

- Helpers & middlewares
  - src/middlewares/gateway-auth.middleware.ts — validate gateway signature (x-user / x-user-signature)
  - src/middlewares/validator.middleware.ts — Joi validation
  - src/middlewares/error-handler.middleware.ts — syntax & error handling
  - src/helpers/* — jwt helper, common, response helpers

Socket & real-time details (critical)
- Namespace: `/uchat` (created in src/sockets/chat.socket.ts). The frontend's chatSocket manager connects to the chat server using CHAT_SOCKET_ROOT + SOCKET_NAMESPACE.
- Rooms: each user joins a personal room using the getChatSocketKey(userId) helper. Code expects other components to use the same helper to emit to users.
- Authentication: socket connections are authenticated by src/middlewares/socket.middlware.ts — JWT is read from query or cookies and must be verified. Do not bypass this middleware.
- Events: the namespace registers events such as private messages, friendConnect/friendDisconnect, messageStatusChanged, group events. Check chat.socket.ts for concrete handlers.
- CORS & origins: Socket.IO server enforces allowed origins from env.ALLOWED_ORIGINS. Do not widen origin checks without security review.
- Scaling: Socket.IO is currently attached to a single HTTP server. For horizontal scaling, introduce an adapter (Redis adapter) and ensure room semantics and message delivery are validated.

Routes overview
- Message routes (src/routes/message.route.ts):
  - GET /chat/messages/:messageStatus/count
  - POST /chat/message/:receiverId
  - GET /chat/messages/:receiverId
  - PATCH /chat/message/:messageId
  - PATCH /chat/messages/received
  - PATCH /chat/messages/read
  - DELETE /chat/message/:messageId
  - DELETE /chat/:receiverId

- User relations routes (see user-relations.route.ts) — friend requests, accept/reject, unread counts.

Inter-service calls & dependencies
- Calls Auth Service: some operations call AUTH_SERVICE (env.AUTH_SERVICE) to fetch user details.
- Database: MongoDB for messages, user relations, and groups.
- Redis: used for ephemeral data and socket state; see src/configs/redis.config.ts.
- Message broker: RabbitMQ-related code exists but is commented out. Do not enable it without provisioning broker infrastructure.

Environment variables (from src/configs/env.config.ts)
- AUTH_SERVICE: URL for internal calls to Auth Service
- ENV, PORT
- MONGO_URI
- JWT_AUTH_SECRET (for socket auth and any JWT verification if done locally)
- REDIS_HOST, REDIS_PORT, REDIS_PASSWORD
- GATEWAY_SECRET (for validating gateway signatures where applicable)
- ALLOWED_ORIGINS (CORS for HTTP and Socket.IO)
- COOKIE_KEYS: JSON containing jwt_token, crypto_token, otp_verified
- SOCKET_NAMESPACE (should match frontend usage)

Dev & maintenance commands
- From microservices/chat-service/:
  - npm run dev — nodemon src/index.ts (development run with Socket.IO)
  - npm run build — tsc compile
  - npm run start — node build/index.js
  - npm run lint — eslint
- From microservices/ root: `npm run dev` will start the gateway, auth-service, and chat-service concurrently (see microservices/package.json)

Testing & verification notes
- Manual verification for sockets:
  1. Start the chat service (and auth + gateway if required for full flow).
  2. Connect the frontend chat client or use a socket.io-client test script to connect to `${CHAT_SOCKET_ROOT}/${SOCKET_NAMESPACE}` with a valid token.
  3. Verify joining personal room, receiving private messages, friendConnect/disconnect events, and message status updates.
- When modifying message persistence, run local data checks to ensure messageStatus transitions (sent -> received -> read) are consistent and notifications are emitted to correct rooms.

Safety & operational guidance (must follow)
- Do NOT change the Socket.IO namespace (`/uchat`) or the per-user room key helper without coordinating frontend and other services — these are part of the public contract.
- Do NOT expose JWTs, user tokens, or secret keys in logs or error messages. Mask sensitive data.
- Do NOT widen CORS or origin checks without security review.
- When adding new socket events, document the event name, payload shape, and expected acknowledgements in this AGENTS.md or a companion docs file.
- For high-traffic or production deployments, plan for Socket.IO scaling (Redis adapter) and test message delivery across multiple nodes.

Implementation patterns & tips
- Use repository classes (message.repository.ts) to centralize DB queries; controllers should use services/repositories rather than raw Mongoose calls where present.
- Use requestContext (src/libs/request-context.lib.ts) to preserve trace metadata across async boundaries when needed for logging.
- Use the existing winston logger for structured logs; avoid console.log in production code.

Prohibited/high-risk operations (without human approval)
- Dropping or truncating production message or relations collections.
- Changing room key format or namespace without coordinated, staged rollout.
- Enabling commented RabbitMQ code in production without infra and end-to-end tests.

Cross-references
- microservices/AGENTS.md — backend-level conventions and rules
- microservices/auth-service/AGENTS.md — authentication flows and gateway contract
- chatting-frontend/ — frontend client that connects directly to this service's Socket.IO namespace

Next recommended actions
- Create `microservices/chat-service/AGENTS.md` (this file) — done.
- Create AGENTS.md for api-gateway and email-service next (recommended: api-gateway then email-service).
- After service AGENTS.md files, create `.kilo` agents and skills to automate safe exploration and common dev commands.

