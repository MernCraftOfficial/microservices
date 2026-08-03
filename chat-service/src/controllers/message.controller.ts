import { NextFunction, Response } from 'express';
import tryCatchErrorHandler from '../helpers/try-catch.helper';
import response from '../helpers/response.helper';
import { JwtRequest } from '../types/common.type';
import { MessageStatus } from '../models/message.model';
import messageService from '../services/message.service';
import userRelationService from '../services/user-relations.service';

export const createMessageForReceiver = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiver = req?.params?.receiverId;
    const sender = req?.user?._id;
    const message = req?.body;

    const newMessage = await messageService.createMessageForReceiver(
      receiver,
      sender,
      message,
    );

    response.sendSuccessResponse(res, 'CREATED', newMessage);
    return;
  },
);

export const getMessageByReceiverId = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const receiver = req?.params?.receiverId;
    const sender = req?.user?._id;
    const page = req?.query?.page;
    const limit = req?.query?.limit;

    const messages = await messageService.getMessageByReceiverId(
      receiver,
      sender,
      page,
      limit,
    );

    response.sendSuccessResponse(res, 'OK', messages);
    return;
  },
);

export const updateMessageById = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const dataToUpdate = req?.body;
    const messageId = req?.params?.messageId;

    const updatedMessage = await messageService.updateMessageById(
      messageId,
      dataToUpdate,
    );

    response.sendSuccessResponse(res, 'OK', updatedMessage);
    return;
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
