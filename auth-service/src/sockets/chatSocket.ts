import { Socket } from 'socket.io';
import { createSocketNamespace } from '../config/socket';

export function startChatSocket() {
  const chatSocket = createSocketNamespace('/uchat');
  chatSocket.on('connection', (socket) => {
    onUserData(socket);
    onSingleChat(socket);
    onGroupChat(socket);
    socket.on('disconnect', () => {
      console.log('Disconnected!');
    });
  });
}

//make users join their own room
function onUserData(socket: Socket) {
  socket.on('userData', (data) => {
    const user_id = data.id;
    socket.join(user_id);
    console.log(data);
  });
}

function onSingleChat(socket: Socket) {
  socket.on('singleChat', (data) => {
    console.log(data);
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
