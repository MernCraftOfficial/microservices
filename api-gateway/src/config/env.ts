import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

interface Env {
  ENV: string;
  PORT: string;
  AUTH_SERVICE: string;
  CHAT_SERVICE: string;
}

const env: Env = {
  ENV: process.env.ENV ?? "prod",
  PORT: process.env.PORT ?? "5000",
  AUTH_SERVICE: process.env.AUTH_SERVICE ?? "",
  CHAT_SERVICE: process.env.CHAT_SERVICE ?? "",
};

export default env;
