import {
  getExpressApp,
  startExpressAppServer,
  includeExpressMiddleware,
  includeExpressRoutes,
} from './config/express';

async function init() {
  //express app instance
  const app = getExpressApp();

  //middlewares
  includeExpressMiddleware(app);

  //routes
  includeExpressRoutes(app);

  //server
  startExpressAppServer(app);
}

init();
