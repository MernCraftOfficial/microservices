import { Namespace, Socket } from 'socket.io';
import { createSocketNamespace } from '../config/socket';
import { createMessage, updateMessage } from '../repository/messageRepository';
let chatSocketNamespace: Namespace | null = null;
export function startChatSocket() {
  chatSocketNamespace = createSocketNamespace('/uchat');
  chatSocketNamespace.on('connection', (socket) => {
    console.log('user connected');
    onUserData(socket);
    onPrivateChat(socket);
    onGroupChat(socket);
    socket.on('disconnect', () => {
      console.log('user disconnected!');
    });
  });
}

//make users join their own room
function onUserData(socket: Socket) {
  socket.on('userData', async (data, ack) => {
    console.log('userData:', data);
    const roomId = data._id;
    await socket.join(roomId);
    ack?.(`You are successfully connected!`);
  });
}

function onPrivateChat(socket: Socket) {
  socket.on('privateMessage', async (data, ack) => {
    const {
      timeStamp = new Date().toISOString(),
      sender = null,
      receiver = null,
      content = null,
      messageType = 'text',
    } = data;

    if (!sender || !receiver) {
      ack?.('Something went wrong!');
      return;
    }

    const message = {
      content: content,
      sender: sender,
      receiver: receiver,
      messageStatus: 'sent',
      messageType: messageType,
      createdAt: timeStamp,
    };

    const savedMessage = await createMessage(message);

    console.log(savedMessage);

    if (!savedMessage) {
      ack?.('Unable to send message!');
      return;
    }

    socket.emit('privateMessageSent', savedMessage);

    if (sender !== receiver) {
      chatSocketNamespace
        ?.to(receiver)
        .emit('privateMessageReceived', savedMessage);
    }
  });

  socket.on('privateMessageReceived', async (data, ack) => {
    const {
      _id = null,
      sender = null,
      receiver = null,
      receivedAt = new Date().toISOString(),
    } = data;
    const updatedMessage = await updateMessage({
      _id: data?._id,
      dataToUpdate: { messageStatus: 'received', receivedAt },
    });

    if (!updatedMessage) {
      ack?.('Unable to change message status!');
      return;
    }

    chatSocketNamespace?.to(sender).emit('messageStatusChanged', {
      _id,
      receiver,
      messageStatus: 'received',
      receivedAt,
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
