import { Request, Response, NextFunction } from 'express';
import response from '../helper/responseHelper';

export interface AppError extends Error {
  status?: number;
}

export const errorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  response.sendErrorResponse(res, 'BAD_REQUEST', err.message);
  return;
};

export const syntaxErrorHandler = (
  err: AppError,
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  if (err instanceof SyntaxError && 'body' in err) {
    response.sendErrorResponse(res, 'BAD_REQUEST', err.message);
    return;
  }
  next();
};
