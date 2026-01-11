import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

interface Env {
  AUTH_SERVICE: string;
  ENV: string;
  PORT: string;
  MONGO_URI: string;
  JWT_AUTH_SECRET: string;
  REDIS_HOST: string;
  REDIS_PORT: number;
  REDIS_PASSWORD: string | null;
  GATEWAY_SECRET: string;
  ALLOWED_ORIGINS: string | undefined;
  COOKIE_KEYS: {
    jwt_token: string;
    crypto_token: string;
    otp_verified: string;
  };
  REDIS_KEY_PREFIX: {
    account_verfication: string;
    reset_password: string;
  };
}

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing Environment Variable :: ${key}`);
  }

  return value;
};

const env: Env = {
  AUTH_SERVICE: requiredEnv('AUTH_SERVICE'),
  ENV: requiredEnv('ENV'),
  PORT: requiredEnv('PORT'),
  MONGO_URI: requiredEnv('MONGO_URI'),
  JWT_AUTH_SECRET: requiredEnv('JWT_AUTH_SECRET'),
  REDIS_HOST: requiredEnv('REDIS_HOST'),
  REDIS_PORT: parseInt(requiredEnv('REDIS_PORT')),
  REDIS_PASSWORD: requiredEnv('REDIS_PASSWORD'),
  COOKIE_KEYS: JSON.parse(requiredEnv('COOKIE_KEYS')),
  REDIS_KEY_PREFIX: JSON.parse(requiredEnv('REDIS_KEY_PREFIX')),
  GATEWAY_SECRET: requiredEnv('GATEWAY_SECRET'),
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS,
};

export default env;
