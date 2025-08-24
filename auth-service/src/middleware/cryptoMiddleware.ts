import { NextFunction, Request, Response } from 'express';
import env from '../config/env';
import {
  generateRedisKey,
  verifyOtp,
  verifyCryptoToken as verifyToken,
} from '../helper/cryptoHelper';
import response from '../helper/responseHelper';
import { destroyRediskey, updateRediskey } from '../config/redis';
export const verifyCryptoToken = (tokenType: string) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    const cookieKey = env.COOKIE_KEYS.crypto_token;
    let token = req?.query[cookieKey] ?? '';

    if (!token && req?.cookies) {
      token = req?.cookies[cookieKey];
    }

    if (!token || typeof token != 'string') {
      response.sendErrorResponse(
        res,
        'BAD_REQUEST',
        'Token is mandatory and must be string!',
      );
      return;
    }

    let value: any = await verifyToken(tokenType, token);

    if (!value) {
      response.sendErrorResponse(res, 'BAD_REQUEST', 'Invalid Token!');
      return;
    }

    value = JSON.parse(value);
    req.body.user = value;
    req.body.redisKey = generateRedisKey(tokenType, token);
    next();
  };
};

export const verifyUserOtp = async (
  req: Request,
  res: Response,
  next: NextFunction,
) => {
  const { otp, user, redisKey } = req?.body;

  if (!user?.isOtpVerified) {
    const isOtpVerified = verifyOtp(user, otp);
    if (!isOtpVerified) {
      response.sendErrorResponse(res, 'BAD_REQUEST', 'Incorrect OTP!');
      return;
    }

    updateRediskey(redisKey, JSON.stringify({ ...user, isOtpVerified }));
  }
  delete user.otp;
  next();
};
