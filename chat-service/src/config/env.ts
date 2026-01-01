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

const env: Env = {
  AUTH_SERVICE: process.env.AUTH_SERVICE ?? '',
  ENV: process.env.ENV ?? 'prod',
  PORT: process.env.PORT ?? '5002',
  MONGO_URI: process.env.MONGO_URI ?? '',
  JWT_AUTH_SECRET: process.env.JWT_AUTH_SECRET ?? '',
  REDIS_HOST: process.env.REDIS_HOST ?? '127.0.0.1',
  REDIS_PORT: parseInt(process.env.REDIS_PORT ?? '6379'),
  REDIS_PASSWORD: process.env.REDIS_PASSWORD ?? null,
  COOKIE_KEYS: JSON.parse(
    process?.env?.COOKIE_KEYS ?? '{"jwt_token":"token","crypto_token":"token"}',
  ),
  REDIS_KEY_PREFIX: JSON.parse(
    process?.env?.REDIS_KEY_PREFIX ??
      '{"account_verfication":"account_verfication","reset_password":"reset_password"}',
  ),
};

export default env;
