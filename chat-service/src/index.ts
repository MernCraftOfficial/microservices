import {
  getExpressApp,
  includeExpressMiddleware,
  includeExpressRoutes,
} from './configs/express.config';

import { initChatSocket } from './sockets/chat.socket';
import { connectToMongoDb } from './configs/db.config';
import { getRedisClient } from './configs/redis.config';
import { startHttpServer } from './configs/http.config';

async function init() {
  //db connection
  await connectToMongoDb();

  //express app instance
  const app = getExpressApp();

  //connect to redis
  // getRedisClient();

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
