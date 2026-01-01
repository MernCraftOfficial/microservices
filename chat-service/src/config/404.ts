import response from '../helper/responseHelper';
import tryCatchErrorHandler from '../helper/tryCatchHelper';
import { Request, Response, NextFunction } from 'express';

const pageNotFound = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    response.sendErrorResponse(res, 'NOT_FOUND', 'Route cannot be found!');
    return;
  },
);

export default pageNotFound;
