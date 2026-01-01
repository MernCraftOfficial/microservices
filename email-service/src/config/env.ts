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
  ALLOWED_ORIGINS: string;
}

const env: Env = {
  APP_NAME: process.env.APP_NAME ?? 'App',
  YEAR: process.env.YEAR ?? '2025',
  ENV: process.env.ENV ?? 'prod',
  PORT: process.env.PORT ?? '5003',
  RABBIT_MQ_URI: process.env.RABBIT_MQ_URI ?? '',
  GMAIL_USER: process.env.GMAIL_USER ?? '',
  GMAIL_PASSWORD: process.env.GMAIL_PASSWORD ?? '',
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? '*',
};

export default env;
