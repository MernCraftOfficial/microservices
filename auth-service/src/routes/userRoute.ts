import { Router } from 'express';
import Validator from '../middleware/validatorMiddleware';
import {
  signin,
  signup,
  searchUser,
  getUserById,
  verifyAccount,
  updateUser,
  forgotPassword,
  resetPassword,
  signout,
  otpVerification,
} from '../controller/userController';
import authenticate from '../middleware/jwtMiddleware';
import {
  verifyCryptoToken,
  verifyUserOtp,
} from '../middleware/cryptoMiddleware';
import env from '../config/env';

const userRoute = Router();

userRoute.post('/signin', Validator('signin'), signin);
userRoute.post('/signup', Validator('signup'), signup);
userRoute.patch(
  '/verify-account',
  verifyCryptoToken(env.REDIS_KEY_PREFIX.account_verfication),
  verifyUserOtp,
  verifyAccount,
);
userRoute.get('/forgot-password', forgotPassword);
userRoute.post(
  '/verify-otp',
  verifyCryptoToken(env.REDIS_KEY_PREFIX.reset_password),
  verifyUserOtp,
  otpVerification,
);
userRoute.patch(
  '/reset-password',
  verifyCryptoToken(env.REDIS_KEY_PREFIX.reset_password),
  verifyUserOtp,
  resetPassword,
);
userRoute.get('/', authenticate, searchUser);
userRoute.get('/signout', signout);
userRoute.get('/:id', authenticate, getUserById);
userRoute.post('/:id', authenticate, updateUser);

export default userRoute;
