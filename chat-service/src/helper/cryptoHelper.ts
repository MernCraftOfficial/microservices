import { randomBytes, randomInt } from 'crypto';
import {
  setRedisKey,
  getRedisKey,
  setRedisExpiry,
  destroyRediskey,
} from '../config/redis';

export async function generateCryptoToken(
  tokenType: string,
  userId: string,
  length: number = 128,
) {
  const token = randomBytes(length).toString('hex');
  const redisKey = generateRedisKey(tokenType, token);
  const otp = generateSecureOTP();
  await setRedisKey(
    redisKey,
    JSON.stringify({ _id: userId, otp, isOtpVerified: false }),
  );
  await setRedisExpiry(redisKey);
  return token;
}

export async function verifyCryptoToken(tokenType: string, token: string) {
  const redisKey = generateRedisKey(tokenType, token);
  const value = await getRedisKey(redisKey);
  return value;
}

export function generateSecureOTP(): string {
  // Generate a number between 100000 and 999999
  const otp = randomInt(100000, 1000000);
  console.log('OTP :' + otp);
  return otp.toString();
}

export function generateRedisKey(tokenType: string, token: string) {
  return `${tokenType}:${token}`;
}

export function verifyOtp(user: any, otp: any) {
  if (user?.otp !== otp) {
    return false;
  }

  return true;
}
