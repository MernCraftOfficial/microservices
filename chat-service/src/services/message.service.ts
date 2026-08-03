import statusCodes from 'http-status-codes';
import { AppError } from '../errors/app.error';
import messageRepository, {
  MessageRepository,
} from '../repositories/message.repository';
import socketService, { SocketService } from './socket.service';
import { MessageStatus } from '../models/message.model';
import userRelationsRepository from '../repositories/user-relations.repository';
import { getChatSocket } from '../sockets/chat.socket';
import { getChatSocketKey } from '../helpers/socket.helper';
import logger from '../configs/winston.config';

class MessageService {
  constructor(
    private readonly messageRepository: MessageRepository,
    private readonly socketService: SocketService,
  ) {}

  async createMessageForReceiver(
    receiver: string,
    sender: string,
    messageData: any,
  ) {
    const message = { ...messageData, receiver, sender };

    logger.info('Create Messaage : ', message);

    const newMessage = await this.messageRepository.createMessage(message);

    if (!newMessage) {
      throw new AppError(
        'Something went wrong!',
        statusCodes.INTERNAL_SERVER_ERROR,
      );
    }

    const updateData = {
      receiver,
      sender,
      count: 1,
      message: message?.content,
    };
    userRelationsRepository.updateLastMessageAndUnreadCount(updateData);

    const chatSocket = getChatSocket();
    chatSocket.to(getChatSocketKey(sender)).emit('privateMessage', newMessage);

    if (sender != receiver) {
      chatSocket
        .to(getChatSocketKey(receiver))
        .emit('privateMessage', newMessage);
    }

    return newMessage;
  }

  async getMessageByReceiverId(
    receiver: string,
    sender: string,
    page?: any,
    limit?: any,
  ) {
    const data = {
      receiver,
      sender,
      page,
      limit,
    };

    const messages = await this.messageRepository.getMessages(data);

    if (!messages) {
      throw new AppError('No message found!', statusCodes.NOT_FOUND);
    }

    return messages;
  }

  async updateMessageById(messageId: string, dataToUpdate: any) {
    const data = { _id: messageId, dataToUpdate };

    const updatedMessage = await this.messageRepository.updateMessage(data);

    if (!updatedMessage) {
      throw new AppError('Unable to update message!', statusCodes.BAD_REQUEST);
    }

    return updatedMessage;
  }

  async readMessage(receiver: string, sender: string) {
    const updatedMessage = await this.messageRepository.markMessagesRead({
      receiver,
      sender,
    });

    if (!updatedMessage) {
      throw new AppError(
        'Unable to mark messages as read',
        statusCodes.BAD_GATEWAY,
      );
    }

    this.socketService.emitMessageStatusChanged({
      sender,
      receiver,
      messageStatus: 'read',
    });

    return updatedMessage;
  }

  async getMessageCountByStatus(
    receiver: string,
    messageStatus: MessageStatus,
  ) {
    const messageCount = await this.messageRepository.getMessageCountByStatus(
      receiver,
      messageStatus as MessageStatus,
    );

    return messageCount;
  }

  async markMessagesReceived(receiver: string, receivedAt: string) {
    const senders = await this.messageRepository.getDistinctSenders(
      receiver,
      'sent',
    );

    if (!senders) {
      return false;
    }

    const updatedMessage = await this.messageRepository.markMessagesReceived(
      receiver,
      receivedAt,
    );

    if (!updatedMessage) {
      throw new AppError('Unable to mark messages received.');
    }

    senders.forEach((sender) => {
      this.socketService.emitMessageStatusChanged({
        sender: sender?._id?.toString(),
        receiver,
        messageStatus: 'received',
      });
    });
  }

  async deleteWholeChat(receiver: string, sender: string) {
    const deletedMessage = await this.messageRepository.deleteWholeChat({
      receiver,
      sender,
    });

    if (!deletedMessage) {
      throw new AppError('Unable to delete chat!');
    }

    return deletedMessage;
  }

  async deleteMessageById(sender: string, _id: string) {
    const deletedMessage = await this.messageRepository.deleteMessageById({
      sender,
      _id,
    });

    if (!deletedMessage) {
      throw new AppError('Unable to delete message!');
    }

    return deletedMessage;
  }
}

const messageService = new MessageService(messageRepository, socketService);
export default messageService;
