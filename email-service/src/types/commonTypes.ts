import { Request } from 'express';

export interface JwtRequest extends Request {
  user?: UserPayload;
}

export interface UserPayload {
  [key: string]: any;
}

export interface CryptoRequest extends Request {
  user?: { _id?: string; otp?: number | string; isOtpVerified?: boolean };
  redisKey?: string;
}
