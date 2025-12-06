import { NextFunction, Request, Response } from 'express';
import tryCatchErrorHandler from '../helper/tryCatchHelper';
import mailer from '../config/nodemailer';
import response from '../helper/responseHelper';

export const sendEmail = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const {
      receiverEmail = null,
      emailTemplate = null,
      subject = null,
      context = {},
    } = req?.body;

    if (!receiverEmail || !emailTemplate || !subject) {
      response.sendErrorResponse(
        res,
        'BAD_REQUEST',
        'Either receiver or template name or subject is missing',
      );
      return;
    }

    const emailData = {
      receiverEmail,
      emailTemplate,
      subject,
      context: context,
    };

    mailer.sendEmail(emailData, (error: any, info: any) => {
      if (error) {
        response.sendErrorResponse(
          res,
          'INTERNAL_SERVER_ERROR',
          error?.message,
        );
        return;
      }

      response.sendSuccessResponse(res, 'OK', 'Email sent!');
      return;
    });
  },
);
