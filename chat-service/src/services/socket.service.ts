import chatSocket from '../sockets/chat.socket';
import { getChatSocketKey } from '../helpers/socket.helper';
import { MessageStatus } from '../models/message.model';

class SocketService {
  public emitMessageStatusChanged({
    sender,
    receiver,
    messageStatus,
  }: {
    sender: string;
    receiver: string;
    messageStatus: MessageStatus;
  }) {
    const socketNamespace = chatSocket.getNamespace();

    socketNamespace.to(getChatSocketKey(sender)).emit('messageStatusChanged', {
      receiver,
      messageStatus,
    });
  }
}

const socketService = new SocketService();
export { SocketService };
export default socketService;
