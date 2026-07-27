import express, { Express } from 'express';
import { urlencoded, json } from 'express';
import env from './env.config';
import pageNotFound from './404.config';
import emailRoute from '../routes/email.route';
import { syntaxErrorHandler } from '../middlewares/error-handler.middleware';

let app: null | Express = null;
export function getExpressApp() {
  if (!app) {
    app = express();
  }

  return app;
}

export function includeExpressMiddleware(app: Express) {
  //body parser
  app.use(urlencoded({ extended: false }));
  app.use(json());
  app.use(syntaxErrorHandler);
}

export function includeExpressRoutes(app: Express) {
  app.use('/email', emailRoute);
  //404 route
  app.all('/{*any}', pageNotFound);
}

export function startExpressAppServer(app: Express) {
  const PORT: string = env.PORT;
  app.listen(PORT, () => {
    console.log(`Email Service is running on port:${PORT}`);
  });
}
