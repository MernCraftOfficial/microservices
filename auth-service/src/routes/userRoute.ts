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
  getMe,
  otpVerification,
  getUsersDataByIds,
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
userRoute.post('/forgot-password', forgotPassword);
userRoute.post(
  '/verify-otp',
  verifyCryptoToken(env.REDIS_KEY_PREFIX.reset_password),
  verifyUserOtp,
  otpVerification,
);
userRoute.patch(
  '/reset-password',
  Validator('reset'),
  verifyCryptoToken(env.REDIS_KEY_PREFIX.reset_password),
  verifyUserOtp,
  resetPassword,
);
userRoute.get('/', authenticate, searchUser);
userRoute.post('/signout', authenticate, signout);
userRoute.get('/me', authenticate, getMe);
userRoute.get('/usersData', authenticate, getUsersDataByIds);
userRoute.get('/:id', authenticate, getUserById);
userRoute.post('/:id', authenticate, updateUser);

export default userRoute;
