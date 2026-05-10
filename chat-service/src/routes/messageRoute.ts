import { Router } from 'express';
import {
  createMessageForReceiver,
  deleteMessageById,
  deleteWholeChat,
  getMessageByReceiverId,
  markMessagesReceived,
  markMessagesRead,
  updateMessageById,
  getMessageCountByStatus,
} from '../controller/messageController';

const messageRoute = Router();

messageRoute.get('/messages/:messageStatus/count', getMessageCountByStatus);
messageRoute.post('/message/:receiverId', createMessageForReceiver);
messageRoute.get('/messages/:receiverId', getMessageByReceiverId);
messageRoute.patch('/message/:messageId', updateMessageById);
messageRoute.patch('/messages/delivered', markMessagesReceived);
messageRoute.patch('/messages/read', markMessagesRead);

messageRoute.delete('/message/:messageId', deleteMessageById);
messageRoute.delete('/:receiverId', deleteWholeChat);
export default messageRoute;
