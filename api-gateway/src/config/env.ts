import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

interface Env {
  ENV: string;
  PORT: string;
  AUTH_SERVICE: string;
  CHAT_SERVICE: string;
  ALLOWED_ORIGINS: string;
}

const env: Env = {
  ENV: process.env.ENV ?? "prod",
  PORT: process.env.PORT ?? "5000",
  AUTH_SERVICE: process.env.AUTH_SERVICE ?? "",
  CHAT_SERVICE: process.env.CHAT_SERVICE ?? "",
  ALLOWED_ORIGINS: process.env.ALLOWED_ORIGINS ?? "",
};

export default env;
