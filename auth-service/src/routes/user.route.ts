import { Router } from 'express';
import Validator from '../middlewares/validator.middleware';
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
  resendOtp,
} from '../controllers/user.controller';
import gatewayAuth from '../middlewares/gateway-auth.middleware';
import {
  verifyCryptoToken,
  verifyUserOtp,
} from '../middlewares/crypto.middleware';
import env from '../configs/env.config';

const userRoute = Router();

userRoute.post('/public/signin', Validator('signin'), signin);
userRoute.post('/public/signup', Validator('signup'), signup);
userRoute.patch(
  '/public/verify-account',
  verifyCryptoToken(env.REDIS_KEY_PREFIX.account_verfication),
  verifyUserOtp,
  verifyAccount,
);
userRoute.post('/public/forgot-password', forgotPassword);
userRoute.post(
  '/public/verify-otp',
  verifyCryptoToken(env.REDIS_KEY_PREFIX.reset_password),
  verifyUserOtp,
  otpVerification,
);

userRoute.get('/public/resend-otp', verifyCryptoToken(), resendOtp);
userRoute.patch(
  '/public/reset-password',
  Validator('reset'),
  verifyCryptoToken(env.REDIS_KEY_PREFIX.reset_password),
  verifyUserOtp,
  resetPassword,
);
userRoute.get('/', gatewayAuth, searchUser);
userRoute.post('/signout', gatewayAuth, signout);
userRoute.get('/me', gatewayAuth, getMe);
userRoute.get('/usersData', gatewayAuth, getUsersDataByIds);
userRoute.get('/:id', gatewayAuth, getUserById);
userRoute.post('/:id', gatewayAuth, updateUser);

export default userRoute;
