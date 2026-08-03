import { Namespace, Socket } from 'socket.io';
import { createSocketNamespace } from '../configs/socket.config';
import authenticate from '../middlewares/socket.middlware';
import { getChatSocketKey } from '../helpers/socket.helper';

class ChatSocket {
  private chatSocketNamespace: Namespace | null = null;

  public init(): undefined {
    if (this.chatSocketNamespace) {
      return;
    }

    this.chatSocketNamespace = createSocketNamespace('/uchat');
    this.chatSocketNamespace.use(authenticate);
    this.chatSocketNamespace.on('connection', this.handleConnection);
  }

  private handleConnection = async (socket: Socket) => {
    console.log('User Connected!');

    await this.onConnection(socket);

    this.registerSocketEvents(socket);

    socket.on('disconnect', () => this.handleDisconnect(socket));
  };

  private registerSocketEvents(socket: Socket) {
    this.onPrivateChat(socket);
    this.onCreateGroup(socket);
    this.onJoinGroup(socket);
    this.onGroupChat(socket);
  }

  /**
   * Make users join their personal room.
   */
  private async onConnection(socket: Socket) {
    const userId = socket.data.userId;

    await socket.join(getChatSocketKey(userId));

    socket.broadcast.emit('onMessageStatusChanged', {
      receiver: userId,
      messageStatus: 'delivered',
      receivedAt: new Date().toISOString(),
    });

    socket.emit('onConnectionSuccess', 'You are successfully connected!');

    socket.broadcast.emit('friendConnect', {
      _id: userId,
    });
  }

  private handleDisconnect(socket: Socket) {
    socket.broadcast.emit('friendDisconnect', {
      _id: socket.data.userId,
    });
  }

  private onPrivateChat(socket: Socket) {
    // Register private chat events here
  }

  private onCreateGroup(socket: Socket) {
    socket.on('createGroup', () => {
      const groupId = 'group creation';

      socket.join(groupId);
    });
  }

  private onJoinGroup(socket: Socket) {
    socket.on('joinGroup', (data) => {
      socket.join(data.group._id);
    });
  }

  private onGroupChat(socket: Socket) {
    socket.on('groupChat', (data) => {
      console.log(data);
    });
  }

  public getNamespace(): Namespace {
    if (!this.chatSocketNamespace) {
      throw new Error('Chat socket not initialized');
    }

    return this.chatSocketNamespace;
  }
}

const chatSocket = new ChatSocket();

export const getChatSocket = () => chatSocket.getNamespace();

export default chatSocket;
