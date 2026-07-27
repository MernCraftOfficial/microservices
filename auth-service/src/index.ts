import {
  getExpressApp,
  startExpressAppServer,
  includeExpressMiddleware,
  includeExpressRoutes,
} from './configs/express.config';
import { connectToMongoDb } from './configs/db.config';
import { getRedisClient } from './configs/redis.config';

async function init() {
  //db connection
  await connectToMongoDb();

  //express app instance
  const app = getExpressApp();

  //connect to redis
  // const redis = getRedisClient();

  //middlewares
  includeExpressMiddleware(app);

  //routes
  includeExpressRoutes(app);

  //server
  startExpressAppServer(app);
}

init();
