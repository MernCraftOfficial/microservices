import express, { Express } from 'express';
import { urlencoded, json } from 'express';
import userRoute from '../routes/userRoute';
import cookiParser from 'cookie-parser';
import env from './env';
import pageNotFound from './404';
import { syntaxErrorHandler } from '../middleware/errorHandlerMiddleware';
import socialAuthRoute from '../routes/socialAuthRoute';

let app: null | Express = null;
export function getExpressApp() {
  if (!app) {
    app = express();
  }

  return app;
}

export function includeExpressMiddleware(app: Express) {
  //body parser
  app.use(cookiParser());
  app.use(urlencoded({ extended: false }));
  app.use(json());
  app.use(syntaxErrorHandler);
}

export function includeExpressRoutes(app: Express) {
  app.use('/user', userRoute);
  app.use('/auth', socialAuthRoute);
  //404 route
  app.all('/{*any}', pageNotFound);
}

export function startExpressAppServer(app: Express) {
  const PORT: string = env.PORT;
  app.listen(PORT, () => {
    console.log(`Auth Service is running on port:${PORT}`);
  });
}
