import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

interface Env {
  ENV: string;
  APP_NAME: string;
  YEAR: string;
  PORT: string;
  RABBIT_MQ_URI: string;
  EMAIL_USER: string;
  GATEWAY_SECRET: string;
  EMAIL_PASSWORD: string;
  EMAIL_FROM: string;
}

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing Environment Variable :: ${key}`);
  }

  return value;
};

const env: Env = {
  APP_NAME: requiredEnv('APP_NAME'),
  YEAR: requiredEnv('YEAR'),
  ENV: requiredEnv('ENV'),
  PORT: requiredEnv('PORT'),
  RABBIT_MQ_URI: requiredEnv('RABBIT_MQ_URI'),
  EMAIL_USER: requiredEnv('EMAIL_USER'),
  EMAIL_PASSWORD: requiredEnv('EMAIL_PASSWORD'),
  GATEWAY_SECRET: requiredEnv('GATEWAY_SECRET'),
  EMAIL_FROM: requiredEnv('EMAIL_FROM'),
};

export default env;
