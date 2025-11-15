import { NextFunction, Response } from 'express';
import tryCatchErrorHandler from '../helper/tryCatchHelper';
import response from '../helper/responseHelper';
import { JwtRequest } from '../types/commonTypes';
import MessageRepository from '../repository/messageRepository';

export const createMessageForReceiver = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiver = req?.params?.receiverId;
    const sender = req?.user?._id;
    let message = req?.body;
    message = { ...message, receiver, sender };

    try {
      const newMessage = await MessageRepository.createMessage(message);

      if (!newMessage) {
        response.sendErrorResponse(
          res,
          'INTERNAL_SERVER_ERROR',
          'Something went wrong!',
        );
      }

      response.sendSuccessResponse(res, 'CREATED', newMessage);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);

export const getMessageByReceiverId = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiver = req?.params?.receiverId;
    const sender = req?.user?._id;
    const data = {
      receiver,
      sender,
      page: req?.query?.page,
      limit: req?.query?.limit,
    };

    try {
      const messages = await MessageRepository.getMessages(data);

      if (!messages) {
        response.sendErrorResponse(res, 'NOT_FOUND', 'No message found!');
        return;
      }

      response.sendSuccessResponse(res, 'OK', messages);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);

export const updateMessageById = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const dataToUpdate = req?.body;
    const messageId = req?.params?.messageId;
    const data = { _id: messageId, dataToUpdate };
    try {
      const updatedMessage = await MessageRepository.updateMessage(data);

      if (!updatedMessage) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable to update message!',
        );
        return;
      }

      response.sendSuccessResponse(res, 'OK', updatedMessage);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const deleteMessageById = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const _id = req?.params?.messageId;
    const sender = req?.user?._id;
    try {
      const deletedMessage = await MessageRepository.deleteMessageById({
        sender,
        _id,
      });
      if (!deletedMessage) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable to delete message!',
        );
        return;
      }

      response.sendSuccessResponse(res, 'OK', deletedMessage);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const deleteWholeChat = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const sender = req?.user?._id;
    const receiver = req?.params?.receiverId;
    try {
      const deletedMessage = await MessageRepository.deleteWholeChat({
        sender,
        receiver,
      });
      if (!deletedMessage) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable to delete chat!',
        );
        return;
      }

      response.sendSuccessResponse(res, 'OK', deletedMessage);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);
