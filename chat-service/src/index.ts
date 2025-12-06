import {
  getExpressApp,
  includeExpressMiddleware,
  includeExpressRoutes,
} from './config/express';

import { startChatSocket } from './sockets/chatSocket';
import { connectToMongoDb } from './config/db';
import { getRedisClient } from './config/redis';
import { startHttpServer } from './config/http';

async function init() {
  //db connection
  await connectToMongoDb();

  //express app instance
  const app = getExpressApp();

  //connect to redis
  const redis = getRedisClient();

  //sockets
  startChatSocket();

  //middlewares
  includeExpressMiddleware(app);

  //routes
  includeExpressRoutes(app);

  //server
  startHttpServer();
}

init();
