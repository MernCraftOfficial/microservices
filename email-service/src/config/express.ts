import express, { Express } from 'express';
import cors from 'cors';
import { urlencoded, json } from 'express';
import env from './env';
import pageNotFound from './404';
import emailRoute from '../routes/emailRoute';

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
  app.use(urlencoded({ extended: false }));
  app.use(json());
}

export function includeExpressRoutes(app: Express) {
  app.use('/email', emailRoute);
  //404 route
  app.all('/{*any}', pageNotFound);
}

export function startExpressAppServer(app: Express) {
  const PORT: string = env.PORT;
  app.listen(PORT, () => {
    console.log(`Listening Express Server at http://localhost:${PORT}`);
  });
}
