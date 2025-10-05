import jwt from 'jsonwebtoken';
import { Response, NextFunction } from 'express';
import env from '../config/env';
import response from '../helper/responseHelper';
import { retrieveJwtToken } from '../helper/commonHelper';
import { JwtRequest } from '../types/commonTypes';
const authenticate = (req: JwtRequest, res: Response, next: NextFunction) => {
  //get the user from jwt and add id to req object
  try {
    let token = retrieveJwtToken(req?.header('authorization'));
    const cookieKey = env.COOKIE_KEYS.jwt_token;

    if (!token && req?.cookies) {
      token = req?.cookies[cookieKey];
    }

    if (!token) {
      response.sendErrorResponse(
        res,
        'UNAUTHORIZED',
        'Authenticate using a valid token!',
      );
      return;
    }

    const userData = jwt.verify(token, env.JWT_AUTH_SECRET);

    if (!userData || typeof userData == 'string') {
      response.sendErrorResponse(res, 'BAD_REQUEST', 'Token does not match!');
      return;
    }

    req.user = userData;
    next();
  } catch (error: any) {
    response.sendServerError(res, 'INTERNAL_SERVER_ERROR', error.message);
    return;
  }
};

export default authenticate;
