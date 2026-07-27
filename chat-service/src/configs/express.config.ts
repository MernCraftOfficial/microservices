import express, { Express, NextFunction, Request, Response } from 'express';
import { urlencoded, json } from 'express';
import cookiParser from 'cookie-parser';
import env from './env.config';
import pageNotFound from './404.config';
import { syntaxErrorHandler } from '../middlewares/error-handler.middleware';
import messageRoute from '../routes/message.route';
import gatewayAuth from '../middlewares/gateway-auth.middleware';
import userRelationRoute from '../routes/user-relations.route';

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
  app.use(gatewayAuth);
  app.use('/chat', userRelationRoute);
  app.use('/chat', messageRoute);
  app.use((err: any, req: Request, res: Response, next: NextFunction) => {
    res.status(500).json({
      success: false,
      message: 'Internal server error',
    });
  });
  //404 route
  app.all('/{*any}', pageNotFound);
}

export function startExpressAppServer(app: Express) {
  const PORT: string = env.PORT;
  app.listen(PORT, () => {
    console.log(`Chat Service is running on port:${PORT}`);
  });
}
