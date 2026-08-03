import statusCodes from 'http-status-codes';
import { AppError } from '../errors/app.error';
import MessageRepository from '../repositories/message.repository';
import socketService from './socket.service';

class MessageService {
  async readMessage(receiver: string, sender: string) {
    const updatedMessage = await MessageRepository.markMessagesRead({
      receiver,
      sender,
    });

    if (!updatedMessage) {
      throw new AppError(
        'Unable to mark messages as read',
        statusCodes.BAD_GATEWAY,
      );
    }

    socketService.emitMessageStatusChanged({
      sender,
      receiver,
      messageStatus: 'read',
    });

    return updatedMessage;
  }
}

const messageService = new MessageService();
export default messageService;
