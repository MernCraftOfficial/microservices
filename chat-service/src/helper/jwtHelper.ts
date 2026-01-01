import jwt from 'jsonwebtoken';
import env from '../config/env';

export const createAuthToken = (userData: any) => {
  const authToken = jwt.sign(userData, env.JWT_AUTH_SECRET, {
    expiresIn: '1d',
  });
  return authToken;
};
