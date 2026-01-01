import jwt from 'jsonwebtoken';
import env from '../config/env';
import { retrieveJwtToken } from '../helper/commonHelper';
import { Socket } from 'socket.io';
import { parseCookies } from '../helper/cookieHelper';
const authenticate = (socket: Socket, next: (error?: any) => void) => {
  //get the user from jwt and add id to req object
  try {
    let token = retrieveJwtToken(socket?.request?.headers?.authorization);
    const cookieKey = env.COOKIE_KEYS.jwt_token;

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
