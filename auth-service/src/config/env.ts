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
  ALLOWED_ORIGINS: string;
  COOKIE_DOMAIN: string;
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
  ENV: requiredEnv('ENV'),
  PORT: requiredEnv('PORT'),
  MONGO_URI: requiredEnv('MONGO_URI'),
  EMAIL_SERVICE: requiredEnv('EMAIL_SERVICE'),
  RABBIT_MQ_URI: requiredEnv('RABBIT_MQ_URI'),
  PASSWORD_PEPPER: requiredEnv('PASSWORD_PEPPER'),
  PASSWORD_SALT_WORK_FACTOR: parseInt(requiredEnv('PASSWORD_SALT_WORK_FACTOR')),
  JWT_AUTH_SECRET: requiredEnv('JWT_AUTH_SECRET'),
  REDIS_HOST: requiredEnv('REDIS_HOST'),
  REDIS_PORT: parseInt(requiredEnv('REDIS_PORT')),
  REDIS_PASSWORD: requiredEnv('REDIS_PASSWORD'),
  ALLOWED_ORIGINS: requiredEnv('ALLOWED_ORIGINS'),
  COOKIE_DOMAIN: requiredEnv('COOKIE_DOMAIN'),
  COOKIE_KEYS: JSON.parse(requiredEnv('COOKIE_KEYS')),
  REDIS_KEY_PREFIX: JSON.parse(requiredEnv('REDIS_KEY_PREFIX')),
};

export default env;
