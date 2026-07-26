import { Namespace, Socket } from 'socket.io';
import { createSocketNamespace } from '../config/socket';
import authenticate from '../middleware/socketMiddlware';
import { getChatSocketKey } from '../helper/socketHelper';
let chatSocketNamespace: Namespace | null = null;
export function initChatSocket() {
  if (chatSocketNamespace) return chatSocketNamespace;
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
  return chatSocketNamespace;
}

//make users join their own room
async function onConnection(socket: Socket) {
  const roomId = socket?.data?.userId;
  await socket.join(getChatSocketKey(roomId));
  const receivedAt = new Date().toISOString();
  socket.broadcast.emit('onMessageStatusChanged', {
    receiver: roomId,
    messageStatus: 'delivered',
    receivedAt,
  });
  socket.emit('onConnectionSuccess', 'You are successfully connected!');
  socket.broadcast.emit('friendConnect', { _id: socket?.data?.userId });
}

function onPrivateChat(socket: Socket) {
  const userId = socket?.data?.userId;
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

export function getChatSocket() {
  if (!chatSocketNamespace) {
    throw new Error('Chat socket not initialized');
  }
  return chatSocketNamespace;
}
