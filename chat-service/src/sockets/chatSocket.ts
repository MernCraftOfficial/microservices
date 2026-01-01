import { Namespace, Socket } from 'socket.io';
import { createSocketNamespace } from '../config/socket';
import messageRepository, {
  createMessage,
  updateMessage,
} from '../repository/messageRepository';
import authenticate from '../middleware/socketMiddlware';
let chatSocketNamespace: Namespace | null = null;
export function startChatSocket() {
  chatSocketNamespace = createSocketNamespace('/uchat');

  chatSocketNamespace.use(authenticate);

  chatSocketNamespace.on('connection', async (socket) => {
    console.log('User Connnected!');
    await onConnection(socket);
    onPrivateChat(socket);
    onGroupChat(socket);
    socket.on('disconnect', () => {
      socket.broadcast.emit('friendDisconnect', { _id: socket?.data?.userId });
    });
  });
}

//make users join their own room
async function onConnection(socket: Socket) {
  const roomId = socket?.data?.userId;
  await socket.join(roomId);
  const receivedAt = new Date().toISOString();
  await messageRepository.markMessagesReceived(roomId, receivedAt);
  socket.broadcast.emit('onMessageStatusChanged', {
    receiver: roomId,
    messageStatus: 'received',
    receivedAt,
  });
  socket.emit('onConnectionSuccess', 'You are successfully connected!');
  socket.broadcast.emit('friendConnect', { _id: socket?.data?.userId });
}

function onPrivateChat(socket: Socket) {
  const userId = socket?.data?.userId;
  socket.on('privateMessage', async (data, ack) => {
    const {
      timeStamp = new Date().toISOString(),
      receiver = null,
      content = null,
      messageType = 'text',
    } = data;

    if (!receiver) {
      ack?.('Something went wrong!');
      return;
    }

    let message = {
      content: content,
      sender: userId,
      receiver: receiver,
      messageStatus: 'sent',
      messageType: messageType,
      createdAt: timeStamp,
      receivedAt: null,
    };

    if (userId == receiver) {
      message = {
        ...message,
        messageStatus: 'read',
        receivedAt: timeStamp,
      };
    }

    const savedMessage = await createMessage(message);

    if (!savedMessage) {
      ack?.('Unable to send message!');
      return;
    }

    socket.emit('privateMessageSent', savedMessage);

    if (userId !== receiver) {
      chatSocketNamespace
        ?.to(receiver)
        .emit('privateMessageReceived', savedMessage);
    }
  });

  socket.on('privateMessageReceived', async (data, ack) => {
    const { sender = null, receivedAt = new Date().toISOString() } = data;

    const updatedMessage = await messageRepository.markMessagesReceived(
      userId,
      receivedAt,
    );

    if (!updatedMessage) {
      ack?.('Unable to change message status!');
      return;
    }

    chatSocketNamespace?.to(sender).emit('onMessageStatusChanged', {
      receiver: userId,
      messageStatus: 'received',
      receivedAt,
    });
  });

  socket.on('markMessageAsRead', async (data) => {
    data.receiver = userId;
    await messageRepository.markMessagesRead(data);

    chatSocketNamespace?.to(data?.sender).emit('onMessageStatusChanged', {
      receiver: userId,
      messageStatus: 'read',
    });
  });
}

function onCreateGroup(socket: Socket) {
  socket.on('createGroup', (data) => {
    const group_id = 'group creation';
    socket.join(group_id);
  });
}

function onJoinGroup(socket: Socket) {
  socket.on('joinGroup', (data) => {
    const group_id = data.group._id;
    socket.join(group_id);
  });
}

function onGroupChat(socket: Socket) {
  socket.on('groupChat', (data) => {
    console.log(data);
  });
}
