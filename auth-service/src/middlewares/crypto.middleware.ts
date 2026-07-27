import { NextFunction, Request, Response } from 'express';
import env from '../configs/env.config';
import {
  generateRedisKey,
  verifyOtp,
  verifyCryptoToken as verifyToken,
} from '../helpers/crypto.helper';
import response from '../helpers/response.helper';
import { updateRediskey } from '../configs/redis.config';
import { setCookie } from '../helpers/cookie.helper';
import { CryptoRequest } from '../types/common.type';

export const verifyCryptoToken = (tokenType?: string) => {
  return async (req: CryptoRequest, res: Response, next: NextFunction) => {
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

    if (!tokenType) {
      const type = req?.query?.['type'];
      switch (type) {
        case 'verify-account':
          tokenType = env.REDIS_KEY_PREFIX.account_verfication;
          break;
        case 'verify-otp':
          tokenType = env.REDIS_KEY_PREFIX.reset_password;
          break;
        default:
          throw new Error('Invalid Token Type!');
      }
    }

    let value: any = await verifyToken(tokenType, token);

    if (!value) {
      response.sendErrorResponse(res, 'BAD_REQUEST', 'Invalid Token!');
      return;
    }

    value = JSON.parse(value);
    req.user = value;
    req.redisKey = generateRedisKey(tokenType, token);
    next();
  };
};

export const verifyUserOtp = async (
  req: CryptoRequest,
  res: Response,
  next: NextFunction,
) => {
  const {
    user,
    redisKey,
    body: { otp },
  } = req;

  if (!user?.isOtpVerified) {
    const isOtpVerified = verifyOtp(user, otp);
    if (!isOtpVerified) {
      response.sendErrorResponse(res, 'BAD_REQUEST', 'Incorrect OTP!');
      return;
    }
    setCookie(res, env?.COOKIE_KEYS?.otp_verified, true);
    updateRediskey(redisKey, JSON.stringify({ ...user, isOtpVerified }));
  }
  delete user?.otp;
  next();
};
