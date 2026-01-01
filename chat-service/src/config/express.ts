import express, { Express, NextFunction, Request, Response } from 'express';
import cors from 'cors';
import { urlencoded, json } from 'express';
import cookiParser from 'cookie-parser';
import env from './env';
import pageNotFound from './404';
import { syntaxErrorHandler } from '../middleware/errorHandlerMiddleware';
import messageRoute from '../routes/messageRoute';
import authenticate from '../middleware/jwtMiddleware';
import userRelationRoute from '../routes/userRelationsRoute';

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
  app.use(authenticate);
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
    console.log(`Chat Service is running at http://localhost:${PORT}`);
  });
}
