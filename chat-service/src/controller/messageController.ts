import { NextFunction, Response } from 'express';
import tryCatchErrorHandler from '../helper/tryCatchHelper';
import response from '../helper/responseHelper';
import { JwtRequest } from '../types/commonTypes';
import MessageRepository from '../repository/messageRepository';
import { getChatSocketKey } from '../helper/socketHelper';
import { getChatSocket } from '../sockets/chatSocket';
import logger from '../config/winston';
import messageRepository from '../repository/messageRepository';
import { Message, MessageStatus } from '../model/Message';
import userRelationsRepository from '../repository/userRelationsRepository';

export const createMessageForReceiver = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiver = req?.params?.receiverId;
    const sender = req?.user?._id;
    let message = req?.body;
    message = { ...message, receiver, sender };

    logger.info('Create Messaage : ', message);

    try {
      const newMessage = await MessageRepository.createMessage(message);

      if (!newMessage) {
        response.sendErrorResponse(
          res,
          'INTERNAL_SERVER_ERROR',
          'Something went wrong!',
        );
      }

      const updateData = {
        receiver,
        sender,
        count: 1,
        message: message?.content,
      };
      const userRelationUpdated =
        userRelationsRepository.updateLastMessageAndUnreadCount(updateData);

      const chatSocket = getChatSocket();
      chatSocket
        .to(getChatSocketKey(sender))
        .emit('privateMessage', newMessage);

      if (sender != receiver) {
        chatSocket
          .to(getChatSocketKey(receiver))
          .emit('privateMessage', newMessage);
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

export const markMessagesReceived = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiver = req?.user?._id;
    const { receivedAt = new Date().toISOString() } = req?.body;
    try {
      const senders = await messageRepository.getDistinctSenders(
        receiver,
        'sent',
      );

      if (!senders) {
        response.sendSuccessResponse(
          res,
          'OK',
          'Messages are already marked received!',
        );
        return;
      }

      const updatedMessage = await MessageRepository.markMessagesDelivered(
        receiver,
        receivedAt,
      );

      if (!updatedMessage) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable mark messages received!',
        );
        return;
      }

      if (senders) {
        const chatSocket = getChatSocket();
        senders.forEach((sender) => {
          chatSocket
            .to(getChatSocketKey(sender?._id?.toString()))
            .emit('messageStatusChanged', {
              receiver,
              messageStatus: 'received',
            });
        });
      }

      response.sendSuccessResponse(res, 'OK', updatedMessage);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const markMessagesRead = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiver = req?.user?._id;
    const { sender = null } = req?.body;

    if (!sender) {
      response.sendErrorResponse(res, 'BAD_REQUEST', 'Sender id is undefined!');
      return;
    }

    try {
      const updatedMessage = await MessageRepository.markMessagesRead({
        receiver,
        sender,
      });

      if (!updatedMessage) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable mark messages read!',
        );
        return;
      }

      const chatSocket = getChatSocket();
      chatSocket.to(getChatSocketKey(sender)).emit('messageStatusChanged', {
        receiver,
        messageStatus: 'read',
      });

      response.sendSuccessResponse(res, 'OK', updatedMessage);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const getMessageCountByStatus = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiverId = req?.user?._id;
    const messageStatus = req?.params?.messageStatus;

    if (!messageStatus) {
      response.sendErrorResponse(res, 'BAD_REQUEST', 'No such message status!');
      return;
    }

    try {
      const messageCount = await MessageRepository.getMessageCountByStatus(
        receiverId,
        messageStatus as MessageStatus,
      );

      response.sendSuccessResponse(res, 'OK', { messageCount });
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);
