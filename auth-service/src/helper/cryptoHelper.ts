import { randomBytes, randomInt } from 'crypto';
import { setRedisKey, getRedisKey, setRedisExpiry } from '../config/redis';

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
  return { token, otp };
}

export async function verifyCryptoToken(tokenType: string, token: string) {
  const redisKey = generateRedisKey(tokenType, token);
  const value = await getRedisKey(redisKey);
  return value;
}

export function generateSecureOTP(): string {
  const otp = randomInt(100000, 1000000);
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
