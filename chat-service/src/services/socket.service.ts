import chatSocket from '../sockets/chat.socket';
import { getChatSocketKey } from '../helpers/socket.helper';

class SocketService {
  public emitMessageStatusChanged({
    sender,
    receiver,
    messageStatus,
  }: {
    sender: string;
    receiver: string;
    messageStatus: 'sent' | 'delivered' | 'read';
  }) {
    const socketNamespace = chatSocket.getNamespace();

    socketNamespace.to(getChatSocketKey(sender)).emit('messageStatusChanged', {
      receiver,
      messageStatus,
    });
  }
}

const socketService = new SocketService();

export default socketService;
