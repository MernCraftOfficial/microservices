import User, { Username } from '../model/User';
import { Request, Response, NextFunction } from 'express';
import {
  extractUsername,
  removeKey,
  sanitizeSearch,
} from '../helper/commonHelper';
import tryCatchErrorHandler from '../helper/tryCatchHelper';
import { createAuthToken } from '../helper/jwtHelper';
import response from '../helper/responseHelper';
import { generateCryptoToken } from '../helper/cryptoHelper';
import { clearCookies, setCookie, unsetCookie } from '../helper/cookieHelper';
import env from '../config/env';
import { destroyRediskey } from '../config/redis';
import { CryptoRequest, JwtRequest } from '../types/commonTypes';
import logger from '../config/winston';
import emailService from '../services/emailService';

export const signin = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const { email, password } = req.body;
    const userDetails = await User.findOne({ email: email });

    if (!userDetails) {
      response.sendErrorResponse(
        res,
        'NOT_FOUND',
        'No account found with this email!',
      );
      return;
    }

    const isPasswordMatched = await userDetails.comparePassword(password);

    if (!isPasswordMatched) {
      response.sendErrorResponse(
        res,
        'UNAUTHORIZED',
        "Password doesn't match!",
      );
      return;
    }

    if (!userDetails?.isVerified) {
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
        'The email already registered with us!',
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
    } catch (error: any) {
      response.sendServerError(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const verifyAccount = tryCatchErrorHandler(
  async (req: CryptoRequest, res: Response, next: NextFunction) => {
    //redis otp validation pending
    const user = req?.user;
    const isVerified = await User.findByIdAndUpdate(
      user?._id,
      { $set: { isVerified: true } },
      { new: true, runValidators: true },
    );

    if (!isVerified) {
      throw new Error('Something went wrong!');
    }

    unsetCookie(res, env.REDIS_KEY_PREFIX.account_verfication);
    unsetCookie(res, env?.COOKIE_KEYS?.otp_verified);

    response.sendSuccessResponse(res, 'OK', 'Account successfully verified');
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
        'Please enter correct email!',
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
  async (req: Request, res: Response, next: NextFunction) => {
    clearCookies(res);
    response.sendSuccessResponse(res, 'OK', 'Signout successful');
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

      response.sendSuccessResponse(res, 'OK', getUser);
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
