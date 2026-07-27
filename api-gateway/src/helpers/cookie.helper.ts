import { Response } from "express";
import env from "../configs/env.config";

export const clearCookies = (res: Response): boolean => {
  Object.values(env.COOKIE_KEYS).forEach((key) => {
    unsetCookie(res, key);
  });
  return true;
};

export const setCookie = (
  res: Response,
  key: string,
  value: string | boolean,
) => {
  res.cookie(key, value, {
    httpOnly: true,
    secure: env.ENV == "dev" ? false : true,
    sameSite: env.ENV == "dev" ? "lax" : "none",
    path: "/",
    maxAge: env.ENV == "dev" ? undefined : 7 * 24 * 60 * 60 * 1000,
  });
  console.table({ type: "Cookie", key, value });

  return true;
};

export const unsetCookie = (res: Response, key: string) => {
  res.clearCookie(key, {
    httpOnly: true,
    secure: env.ENV == "dev" ? false : true,
    sameSite: env.ENV == "dev" ? "lax" : "none",
    path: "/",
  });
  return true;
};
