import {
  getExpressApp,
  includeExpressMiddleware,
  includeExpressRoutes,
} from './config/express';

import { initChatSocket } from './sockets/chatSocket';
import { connectToMongoDb } from './config/db';
import { getRedisClient } from './config/redis';
import { startHttpServer } from './config/http';

async function init() {
  //db connection
  await connectToMongoDb();

  //express app instance
  const app = getExpressApp();

  //connect to redis
  getRedisClient();

  //sockets
  initChatSocket();

  //middlewares
  includeExpressMiddleware(app);

  //routes
  includeExpressRoutes(app);

  //server
  startHttpServer();
}

init();
