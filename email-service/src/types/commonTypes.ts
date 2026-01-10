import { JwtPayload } from 'jsonwebtoken';
import { Request } from 'express';

export interface JwtRequest extends Request {
  user?: JwtPayload;
}

export interface CryptoRequest extends Request {
  user?: { _id?: string; otp?: number | string; isOtpVerified?: boolean };
  redisKey?: string;
}
