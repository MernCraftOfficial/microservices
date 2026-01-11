import { Request } from 'express';

export interface JwtRequest extends Request {
  user?: { _id: string };
}

export interface CryptoRequest extends Request {
  user?: { _id?: string; otp?: number | string; isOtpVerified?: boolean };
  redisKey?: string;
}
