import response from '../helpers/response.helper';
import tryCatchErrorHandler from '../helpers/try-catch.helper';
import { Request, Response, NextFunction } from 'express';

const pageNotFound = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    response.sendErrorResponse(res, 'NOT_FOUND', 'Route cannot be found!');
    return;
  },
);

export default pageNotFound;
