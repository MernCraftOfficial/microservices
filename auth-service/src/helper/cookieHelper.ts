import { Response } from 'express';
import env from '../config/env';

export const clearCookies = (res: Response): boolean => {
  Object.values(env.COOKIE_KEYS).forEach((key) => {
    res.clearCookie(key, {
      httpOnly: true,
      secure: env.ENV == 'dev' ? false : true,
      sameSite: 'lax',
    });
  });
  return true;
};

export const setCookie = (res: Response, key: string, value: string) => {
  res.cookie(key, value, {
    httpOnly: true,
    secure: env.ENV == 'dev' ? false : true,
    sameSite: 'lax',
  });
};
