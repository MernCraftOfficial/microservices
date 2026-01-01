import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

interface Env {
  ENV: string;
  PORT: string;
  MONGO_URI: string;
  EMAIL_SERVICE: string;
  RABBIT_MQ_URI: string;
  PASSWORD_PEPPER: string;
  PASSWORD_SALT_WORK_FACTOR: number;
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
  ENV: process.env.ENV ?? 'prod',
  PORT: process.env.PORT ?? '5001',
  MONGO_URI: process.env.MONGO_URI ?? '',
  EMAIL_SERVICE: process.env.EMAIL_SERVICE ?? '',
  RABBIT_MQ_URI: process.env.RABBIT_MQ_URI ?? '',
  PASSWORD_PEPPER: process.env.PASSWORD_PEPPER ?? '',
  PASSWORD_SALT_WORK_FACTOR:
    parseInt(process.env.PASSWORD_SALT_WORK_FACTOR ?? '10') ?? 10,
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
