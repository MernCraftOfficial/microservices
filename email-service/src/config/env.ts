import dotenv from 'dotenv';
dotenv.config({ path: './.env.local' });

interface Env {
  ENV: string;
  APP_NAME: string;
  YEAR: string;
  PORT: string;
  RABBIT_MQ_URI: string;
  GMAIL_USER: string;
  GMAIL_PASSWORD: string;
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
  GMAIL_USER: requiredEnv('GMAIL_USER'),
  GMAIL_PASSWORD: requiredEnv('GMAIL_PASSWORD'),
};

export default env;
