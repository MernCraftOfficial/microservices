import { Namespace, Server } from 'socket.io';
import { getHttpServerInstance } from './http';
import env from './env';

let io: Server | null = null;
let chatSocketNamespace: Namespace | null = null;
export function getSocketInstance() {
  if (!io) {
    const httpServer = getHttpServerInstance();
    const allowedOrigins = env.ALLOWED_ORIGINS?.split(',').map((o) => o.trim());

    io = new Server(httpServer, {
      cors: {
        origin: (origin, callback) => {
          // origin can be undefined (Postman, curl, mobile apps)
          if (!origin) {
            return callback(null, true);
          }

          if (!allowedOrigins || allowedOrigins?.includes(origin)) {
            return callback(null, true);
          }

          return callback(new Error(`Origin ${origin} not allowed by CORS`));
        },
        methods: ['GET', 'POST'],
      },
    });
  }
  return io;
}

export function createSocketNamespace(namespace: string) {
  const io = getSocketInstance();
  return io.of(namespace);
}
