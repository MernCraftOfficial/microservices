import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

interface Env {
  ENV: string;
  PORT: string;
  AUTH_SERVICE: string;
  CHAT_SERVICE: string;
  ALLOWED_ORIGINS: string;
}

const requiredEnv = (key: string): string => {
  const value = process.env[key];

  if (!value) {
    throw new Error(`Missing Environment Variable :: ${key}`);
  }

  return value;
};

const env: Env = {
  ENV: requiredEnv("ENV"),
  PORT: requiredEnv("PORT"),
  AUTH_SERVICE: requiredEnv("AUTH_SERVICE"),
  CHAT_SERVICE: requiredEnv("CHAT_SERVICE"),
  ALLOWED_ORIGINS: requiredEnv("ALLOWED_ORIGINS"),
};

export default env;
