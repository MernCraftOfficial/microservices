import express, { Express } from 'express';
import cors from 'cors';
import { urlencoded, json } from 'express';
import userRoute from '../routes/userRoute';
import env from './env';
import pageNotFound from './404';
import { Request, Response, NextFunction } from 'express';
import { syntaxErrorHandler } from '../middleware/errorHandlerMiddleware';

let app: null | Express = null;
export function getExpressApp() {
  if (!app) {
    app = express();
  }

  return app;
}

export function includeExpressMiddleware(app: Express) {
  //body parser
  app.use(cors());
  app.use(urlencoded({ extended: false }));
  app.use(json());
  app.use(syntaxErrorHandler);
}

export function includeExpressRoutes(app: Express) {
  app.use('/user', userRoute);

  //404 route
  app.all('/{*any}', pageNotFound);
}

export function startExpressAppServer(app: Express) {
  const PORT: string = env.PORT;
  app.listen(PORT ?? 5000, () => {
    console.log(`Listening Express Server at http://localhost:${PORT}`);
  });
}
