import logger from '../configs/winston.config';
import { Message, MessageStatus } from '../models/message.model';

export const createMessage = async (data: any) => {
  const message = {
    content: data?.content,
    sender: data?.sender,
    receiver: data?.receiver,
    messageStatus: data?.messageStatus,
    messageType: data?.messageType,
    createdAt: data?.createdAt,
    updatedAt: data?.updatedAt,
    receivedAt: data?.receivedAt,
  };

  if (data?.sender == data?.receiver) {
    message.messageStatus = 'read';
    message.receivedAt = message.createdAt;
  }

  const newMessage = await Message.create(message);
  const messageId = newMessage?._id?.toString();

  if (!newMessage || !messageId) {
    return false;
  }

  return newMessage;
};

export const updateMessage = async (data: any) => {
  const { _id = null, dataToUpdate = {} } = data;
  let { receivedAt = new Date().toISOString(), messageStatus = null } =
    dataToUpdate;
  dataToUpdate.updatedAt = new Date().toISOString();

  if (messageStatus == null) {
    delete dataToUpdate.messageStatus;
  }

  const updateMessage = await Message.updateOne(
    { _id: _id },
    { $set: { ...dataToUpdate, receivedAt } },
    { runValidators: true },
  );

  if (!updateMessage || updateMessage?.matchedCount == 0) {
    return false;
  }

  return updateMessage;
};

export const getMessages = async (data: any) => {
  const { sender = null, receiver = null, limit = 50, page = 0 } = data;

  const messages = await Message.find({
    $or: [
      { sender, receiver },
      { sender: receiver, receiver: sender },
    ],
  })
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);

  if (!messages) {
    return false;
  }

  return messages;
};

export const deleteMessageById = async ({
  _id,
  sender,
}: {
  _id: string;
  sender: string;
}) => {
  const deletedMessage = await Message.deleteOne({ _id, sender });

  if (!deletedMessage || deletedMessage?.deletedCount == 0) {
    return false;
  }

  return deletedMessage;
};

export const deleteWholeChat = async ({
  sender,
  receiver,
}: {
  sender: string;
  receiver: string;
}) => {
  const deletedChat = await Message.deleteMany({ sender, receiver });
  if (!deletedChat || deletedChat?.deletedCount == 0) {
    return false;
  }

  return deletedChat;
};

export const markMessagesDelivered = async (
  receiverId: string,
  receivedAt: string = new Date().toISOString(),
) => {
  const markReceived = await Message.updateMany(
    { receiver: receiverId, messageStatus: 'sent' },
    { $set: { messageStatus: 'received', receivedAt } },
    { runValidators: true },
  );

  if (!markReceived || markReceived?.matchedCount == 0) {
    return false;
  }

  return markReceived;
};

export const markMessagesRead = async (data: any) => {
  const { receiver = null, sender = null, messageStatus = 'read' } = data;

  const markReceived = await Message.updateMany(
    { receiver, sender },
    { $set: { messageStatus } },
    { runValidators: true },
  );

  if (!markReceived || markReceived?.matchedCount == 0) {
    return false;
  }

  return markReceived;
};

export const getDistinctSenders = async (
  receiverId: string,
  messageStatus: MessageStatus,
) => {
  const distinctSenders = await Message.distinct('sender', {
    receiver: receiverId,
    messageStatus: messageStatus,
  });

  logger.info(`Sender of ${receiverId}`, distinctSenders);

  if (!distinctSenders || distinctSenders?.length == 0) {
    return false;
  }

  return distinctSenders;
};

export const getMessageCountByStatus = async (
  receiverId: string,
  status: MessageStatus,
) => {
  if (!receiverId || !status) {
    return false;
  }

  const messageCount = await Message.countDocuments({
    messageStatus: status,
    receiver: receiverId,
  });

  if (!messageCount) {
    return false;
  }

  return messageCount;
};

export default {
  createMessage,
  updateMessage,
  getMessages,
  deleteMessageById,
  deleteWholeChat,
  markMessagesDelivered,
  markMessagesRead,
  getDistinctSenders,
  getMessageCountByStatus,
};
