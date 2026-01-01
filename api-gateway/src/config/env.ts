import dotenv from "dotenv";
dotenv.config({ path: "./.env.local" });

interface Env {
  ENV: string;
  PORT: string;
}

const env: Env = {
  ENV: process.env.ENV ?? "prod",
  PORT: process.env.PORT ?? "5000",
};

export default env;
