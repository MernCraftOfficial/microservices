import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

interface Env {
  ENV: string;
  PORT: string;
  AUTH_SERVICE: string;
  CHAT_SERVICE: string;
  ALLOWED_ORIGINS: string;
  JWT_AUTH_SECRET: string;
  GATEWAY_SECRET: string;
  COOKIE_KEYS: {
    jwt_token: string;
    crypto_token: string;
    otp_verified: string;
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
  ENV: requiredEnv("ENV"),
  PORT: requiredEnv("PORT"),
  AUTH_SERVICE: requiredEnv("AUTH_SERVICE"),
  CHAT_SERVICE: requiredEnv("CHAT_SERVICE"),
  ALLOWED_ORIGINS: requiredEnv("ALLOWED_ORIGINS"),
  COOKIE_KEYS: JSON.parse(requiredEnv("COOKIE_KEYS")),
  JWT_AUTH_SECRET: requiredEnv("JWT_AUTH_SECRET"),
  GATEWAY_SECRET: requiredEnv("GATEWAY_SECRET"),
};

export default env;
