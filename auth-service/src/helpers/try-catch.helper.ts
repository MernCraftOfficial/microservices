import { RequestHandler, Request, Response, NextFunction } from 'express';
import response from './response.helper';

const tryCatchErrorHandler = (requestHandler: RequestHandler) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      requestHandler(req, res, next);
    } catch (error: any) {
      response.sendServerError(res, 'INTERNAL_SERVER_ERROR', error.message);
      return;
    }
  };
};

export default tryCatchErrorHandler;
