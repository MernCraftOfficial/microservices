import {
  getExpressApp,
  startExpressAppServer,
  includeExpressMiddleware,
  includeExpressRoutes,
} from "./configs/express.config";

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
