import User, { Username } from '../models/user.model';
import { Request, Response, NextFunction } from 'express';
import {
  extractUsername,
  removeKey,
  retrieveJwtToken,
  sanitizeSearch,
} from '../helpers/common.helper';
import tryCatchErrorHandler from '../helpers/try-catch.helper';
import { createAuthToken } from '../helpers/jwt.helper';
import response from '../helpers/response.helper';
import {
  generateCryptoToken,
  generateSecureOTP,
} from '../helpers/crypto.helper';
import { clearCookies, setCookie, unsetCookie } from '../helpers/cookie.helper';
import env from '../configs/env.config';
import {
  destroyRediskey,
  getRedisKey,
  updateRediskey,
} from '../configs/redis.config';
import { CryptoRequest, JwtRequest } from '../types/common.type';
import logger from '../configs/winston.config';
import emailService from '../services/email.service';
import { RedisKey } from 'ioredis';

export const signin = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const userDetails = await User.findOne({ email: email });

    if (!userDetails) {
      response.sendErrorResponse(res, 'UNAUTHORIZED', 'Invalid credentials!');
      return;
    }

    const isPasswordMatched = await userDetails.comparePassword(password);

    if (!isPasswordMatched) {
      response.sendErrorResponse(res, 'UNAUTHORIZED', 'Invalid credentials!');
      return;
    }
    if (!env.BYPASS_VERIFICATION && !userDetails?.isVerified) {
      const accountVerificationToken = await generateCryptoToken(
        env.REDIS_KEY_PREFIX.account_verfication,
        userDetails?._id,
      );

      setCookie(
        res,
        env.COOKIE_KEYS.crypto_token,
        accountVerificationToken?.token,
      );

      //send email
      emailService.sendEmail({
        receiverEmail: email,
        emailTemplate: 'account-verification',
        subject: 'Verify Your Account',
        context: {
          name: userDetails?.username?.firstname,
          otp: accountVerificationToken?.otp,
        },
      });

      response.sendErrorResponse(res, 'FORBIDDEN', {
        token: accountVerificationToken?.token,
        error: 'Verify your account first',
      });

      return;
    }

    await User.updateOne(
      { _id: userDetails?._id },
      { $set: { status: 'active' } },
      { runValidators: true },
    );

    const accessToken = createAuthToken({ _id: userDetails?._id });
    setCookie(res, env.COOKIE_KEYS?.jwt_token, accessToken);
    response.sendSuccessResponse(res, 'OK', {
      ...removeKey.apply(userDetails.toObject(), ['password', '__v']),
      [env.COOKIE_KEYS?.jwt_token]: accessToken,
    });
    return;
  },
);

export const signup = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password, username } = req.body;

    const userDetails = await User.findOne({ email: email });

    if (userDetails) {
      response.sendErrorResponse(
        res,
        'CONFLICT',
        'This email is already registered with us!',
      );
      return;
    }

    try {
      const extractedUsername: Username = extractUsername(username);
      const newUser = await User.create({
        username: extractedUsername,
        email,
        password,
      });

      const userId = newUser?._id?.toString();

      if (!newUser || !userId) {
        response.sendServerError(
          res,
          'INTERNAL_SERVER_ERROR',
          'Error while creating user!',
        );
        return;
      }

      if (!env.BYPASS_VERIFICATION) {
        const accountVerificationToken = await generateCryptoToken(
          env.REDIS_KEY_PREFIX.account_verfication,
          userId,
        );

        setCookie(
          res,
          env.COOKIE_KEYS.crypto_token,
          accountVerificationToken?.token,
        );

        //send email
        emailService.sendEmail({
          receiverEmail: email,
          emailTemplate: 'account-verification',
          subject: 'Verify Your Account',
          context: {
            name: extractedUsername?.firstname,
            otp: accountVerificationToken?.otp,
          },
        });

        response.sendSuccessResponse(res, 'OK', {
          token: accountVerificationToken?.token,
        });
        return;
      }

      const accessToken = createAuthToken({ _id: newUser?._id });
      setCookie(res, env.COOKIE_KEYS?.jwt_token, accessToken);
      response.sendSuccessResponse(res, 'OK', {
        ...removeKey.apply(newUser.toObject(), ['password', '__v']),
        [env.COOKIE_KEYS?.jwt_token]: accessToken,
      });
      return;
    } catch (error: any) {
      response.sendServerError(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const verifyAccount = tryCatchErrorHandler(
  async (req: CryptoRequest, res: Response, next: NextFunction) => {
    //redis otp validation pending
    const { user = null, redisKey } = req;
    const isVerified = await User.findByIdAndUpdate(
      user?._id,
      { $set: { isVerified: true } },
      { new: true, runValidators: true },
    );

    if (!isVerified) {
      throw new Error('Something went wrong!');
    }

    destroyRediskey(redisKey);
    unsetCookie(res, env?.COOKIE_KEYS?.crypto_token);
    unsetCookie(res, env?.COOKIE_KEYS?.otp_verified);
    const accessToken = createAuthToken({ _id: user?._id });
    setCookie(res, env.COOKIE_KEYS?.jwt_token, accessToken);

    response.sendSuccessResponse(res, 'OK', {
      ...removeKey.apply(isVerified.toObject(), ['password', '__v']),
      [env.COOKIE_KEYS?.jwt_token]: accessToken,
    });
    return;
  },
);

export const updateUser = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {},
);

export const forgotPassword = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email } = req?.body;
    const isUserExist = await User.findOne({
      email,
      isVerified: true,
    }).select('_id username');

    const userId = isUserExist?._id?.toString() ?? '';

    if (!isUserExist || !userId) {
      response.sendErrorResponse(
        res,
        'NOT_FOUND',
        'Please enter correct email or use verified email!',
      );
      return;
    }

    const forgotPasswordToken = await generateCryptoToken(
      env.REDIS_KEY_PREFIX.reset_password,
      userId,
    );

    setCookie(res, env.COOKIE_KEYS.crypto_token, forgotPasswordToken?.token);

    //send email
    emailService.sendEmail({
      receiverEmail: email,
      emailTemplate: 'reset-password',
      subject: 'Reset Your Password',
      context: {
        name: isUserExist?.username?.firstname,
        otp: forgotPasswordToken?.otp,
      },
    });

    response.sendSuccessResponse(res, 'OK', {
      token: forgotPasswordToken?.token,
      email,
    });
    return;
  },
);

export const otpVerification = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    response.sendSuccessResponse(res, 'OK', 'OTP successfully matched!');
    return;
  },
);

export const resendOtp = tryCatchErrorHandler(
  async (req: CryptoRequest, res: Response, next: NextFunction) => {
    let { user = null, redisKey = null } = req;

    let redisData: any = await getRedisKey(redisKey as RedisKey);
    redisData = JSON.parse(redisData ?? '');

    const userDetails = await User.findOne(
      { _id: user?._id },
      { email: 1, _id: 0 },
    );

    if (!userDetails?.email || !redisData) {
      response.sendErrorResponse(
        res,
        'NOT_FOUND',
        'User email cannot be found!',
      );
      return;
    }

    const otp = generateSecureOTP();

    await updateRediskey(
      redisKey as RedisKey,
      JSON.stringify({
        ...redisData,
        otp,
      }),
    );

    //send email
    emailService.sendEmail({
      receiverEmail: userDetails.email,
      emailTemplate: 'account-verification',
      subject: 'Verify Your Account',
      context: {
        name: userDetails?.username?.firstname,
        otp: otp,
      },
    });

    response.sendSuccessResponse(res, 'OK', 'OTP successfully resent!');
    return;
  },
);

export const resetPassword = tryCatchErrorHandler(
  async (req: CryptoRequest, res: Response, next: NextFunction) => {
    let {
      user,
      redisKey,
      body: { password },
    } = req;

    password = password.trim();
    if (!password) {
      response.sendErrorResponse(
        res,
        'BAD_REQUEST',
        'Password cannot be empty!',
      );
      return;
    }

    const userDetails = await User.findOne({ _id: user?._id });

    if (!userDetails) {
      response.sendErrorResponse(res, 'NOT_FOUND', 'Something went wrong!');
      return;
    }

    try {
      userDetails.password = password;
      const isPasswordUpdated = await userDetails.save();
      if (!isPasswordUpdated) {
        throw new Error('Something went wrong!');
      }
      destroyRediskey(redisKey);
      unsetCookie(res, env.COOKIE_KEYS.crypto_token);
      unsetCookie(res, env?.COOKIE_KEYS?.otp_verified);
      response.sendSuccessResponse(res, 'OK', 'Password successfully updated!');
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
    }
  },
);

export const searchUser = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    let searchTerm = req?.query?.search;
    let searchBy = req?.query?.searchBy;
    if (typeof searchTerm != 'string' || typeof searchBy != 'string') {
      response.sendErrorResponse(
        res,
        'BAD_REQUEST',
        '"search" and "searchBy" values must be provided and should be string only!',
      );
      return;
    }

    searchTerm = sanitizeSearch(searchTerm);
    searchBy = sanitizeSearch(searchBy);

    if (!['email', 'username'].includes(searchBy)) {
      response.sendErrorResponse(
        res,
        'BAD_REQUEST',
        'Search by email or username only!',
      );
      return;
    }

    let matchObj = {};
    if (searchBy == 'email') {
      matchObj = { email: { $regex: searchTerm, $options: 'i' } };
    } else if (searchBy == 'username') {
      const username = extractUsername(searchTerm);
      matchObj = {
        'username.firstname': { $regex: username.firstname, $options: 'i' },
      };

      if (username.lastname) {
        matchObj = {
          $and: [
            {
              'username.firstname': {
                $regex: username.firstname,
                $options: 'i',
              },
            },
            {
              'username.lastname': { $regex: username.lastname, $options: 'i' },
            },
          ],
        };
      }
    }

    const userList = await User.aggregate([
      {
        $match: matchObj,
      },
      {
        $project: {
          __v: 0,
          password: 0,
        },
      },
    ]);

    if (userList.length === 0) {
      response.sendErrorResponse(
        res,
        'NOT_FOUND',
        'No user found with this search term!',
      );
      return;
    }

    response.sendSuccessResponse(res, 'OK', userList);
    return;
  },
);

export const getUserById = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userId = req.params.id;
    try {
      const getUser = await User.findById(userId).select('-password -__v');
      if (!getUser) {
        response.sendErrorResponse(
          res,
          'NOT_FOUND',
          'User is not registered with us!',
        );
        return;
      }

      response.sendSuccessResponse(res, 'OK', getUser);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);

export const signout = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    let { user = null } = req;

    try {
      await User.updateOne(
        { _id: user?._id },
        { $set: { status: 'offline' } },
        { runValidators: true },
      );
      clearCookies(res);
      response.sendSuccessResponse(res, 'OK', 'Signout successful');
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error?.message);
      return;
    }
  },
);

export const getMe = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, nex: NextFunction) => {
    const { user } = req;

    if (!user) {
      clearCookies(res);
      response.sendErrorResponse(res, 'UNAUTHORIZED', 'Please sign in again!');
      return;
    }

    try {
      const getUser = await User.findById(user?._id).select('-password -__v');
      if (!getUser) {
        response.sendErrorResponse(
          res,
          'NOT_FOUND',
          'User is not registered with us!',
        );
        return;
      }

      let token = retrieveJwtToken(req?.header('authorization'));
      const cookieKey = env.COOKIE_KEYS.jwt_token;

      if (!token && req?.cookies) {
        token = req?.cookies[cookieKey];
      }

      response.sendSuccessResponse(res, 'OK', {
        ...removeKey.apply(getUser.toObject(), ['password', '__v']),
        [env.COOKIE_KEYS?.jwt_token]: token,
      });

      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);

export const getUsersDataByIds = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const userIds = req?.query?.ids;

    if (!userIds) {
      response.sendErrorResponse(
        res,
        'BAD_REQUEST',
        'Please provide user ids!',
      );
      return;
    }

    const userIdsArray = userIds.toString().split(',');

    try {
      const users = await User.find({
        _id: { $in: userIdsArray },
      }).select('-password -__v');

      if (!users) {
        response.sendErrorResponse(
          res,
          'NOT_FOUND',
          'Users are not registered with us!',
        );
        return;
      }

      response.sendSuccessResponse(res, 'OK', users);
      return;
    } catch (error: any) {
      logger.error(error);
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);

export const updateUserStatus = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    let { user } = req;
    let { status = 'offline' } = req?.body;

    try {
      await User.updateOne(
        { _id: user?._id },
        { $set: { status } },
        { runValidators: true },
      );

      response.sendSuccessResponse(res, 'OK', 'User status is updated!');
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);
