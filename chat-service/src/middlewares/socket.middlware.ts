import jwt from 'jsonwebtoken';
import env from '../configs/env.config';
import { retrieveJwtToken } from '../helpers/common.helper';
import { Socket } from 'socket.io';
import { parseCookies } from '../helpers/cookie.helper';
const authenticate = (socket: Socket, next: (error?: any) => void) => {
  //get the user from jwt and add id to req object
  try {
    let token = null;
    const cookieKey = env.COOKIE_KEYS.jwt_token;

    if (socket?.handshake?.query && socket?.handshake?.query[cookieKey]) {
      token = retrieveJwtToken(socket?.handshake?.query[cookieKey] as string);
    }

    let cookies = parseCookies(socket?.request?.headers?.cookie || '');
    if (!token && cookies) {
      token = cookies[cookieKey];
    }

    if (!token) {
      return next(new Error('Authenticate using a valid token'));
    }

    const userData = jwt.verify(token, env.JWT_AUTH_SECRET);

    if (!userData || typeof userData == 'string') {
      return next(new Error('Unauthorized'));
    }

    socket.data.userId = userData?._id;
    return next();
  } catch (error: any) {
    return next(new Error('Unauthorized!'));
  }
};

export default authenticate;
