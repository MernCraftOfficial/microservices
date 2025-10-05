import express, { Express } from 'express';
import cors from 'cors';
import { urlencoded, json } from 'express';
import userRoute from '../routes/userRoute';
import cookiParser from 'cookie-parser';
import env from './env';
import pageNotFound from './404';
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
  app.use(
    cors({
      origin: 'http://localhost:3000', // your Next.js frontend
      credentials: true,
    }),
  );
  app.use(cookiParser());
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
