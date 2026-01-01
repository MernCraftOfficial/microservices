import { Router } from 'express';
import {
  createMessageForReceiver,
  deleteMessageById,
  deleteWholeChat,
  getMessageByReceiverId,
  updateMessageById,
} from '../controller/messageController';

const messageRoute = Router();

messageRoute.post('/message/:receiverId', createMessageForReceiver);
messageRoute.get('/messages/:receiverId', getMessageByReceiverId);

messageRoute.patch('/message/:messageId', updateMessageById);
messageRoute.delete('/message/:messageId', deleteMessageById);
messageRoute.delete('/:receiverId', deleteWholeChat);
export default messageRoute;
