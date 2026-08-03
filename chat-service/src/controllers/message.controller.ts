import { NextFunction, Response } from 'express';
import tryCatchErrorHandler from '../helpers/try-catch.helper';
import response from '../helpers/response.helper';
import { JwtRequest } from '../types/common.type';
import MessageRepository from '../repositories/message.repository';
import { getChatSocketKey } from '../helpers/socket.helper';
import { getChatSocket } from '../sockets/chat.socket';
import logger from '../configs/winston.config';
import messageRepository from '../repositories/message.repository';
import { Message, MessageStatus } from '../models/message.model';
import userRelationsRepository from '../repositories/user-relations.repository';
import messageService from '../services/message.service';
import userRelationService from '../services/user-relations.service';

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

    if (!_id) {
      response.sendErrorResponse(res, 'BAD_REQUEST');
      return;
    }

    const deletedMessage = await messageService.deleteMessageById(sender, _id);

    response.sendSuccessResponse(res, 'OK', deletedMessage);
    return;
  },
);

export const deleteWholeChat = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const sender = req?.user?._id;
    const receiver = req?.params?.receiverId;
    const deletedMessage = await messageService.deleteWholeChat(
      receiver,
      sender,
    );

    response.sendSuccessResponse(res, 'OK', deletedMessage);
    return;
  },
);

export const markMessagesReceived = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiver = req?.user?._id;
    const { receivedAt = new Date().toISOString() } = req?.body;

    const updatedMessage = await messageService.markMessagesReceived(
      receiver,
      receivedAt,
    );

    response.sendSuccessResponse(res, 'OK', updatedMessage);
    return;
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

    const updatedMessage = await messageService.readMessage(receiver, sender);
    await userRelationService.resetUnreadCount(receiver, sender);

    response.sendSuccessResponse(res, 'OK', updatedMessage);
    return;
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

    const messageCount = await messageService.getMessageCountByStatus(
      receiverId,
      messageStatus as MessageStatus,
    );

    response.sendSuccessResponse(res, 'OK', { messageCount });
    return;
  },
);
