import logger from '../config/winston';
import { UserRelations } from '../model/UserRelations';

export const createUserRelation = async (data: any) => {
  let status = 'pending';
  const {
    participantA = null,
    participantB = null,
    relationType = null,
    role = null,
  } = data;

  if (!relationType || !participantB || !participantA) {
    return false;
  }

  if (participantA == participantB) {
    status = 'accepted';
  }

  const mapping = {
    participantA,
    participantB,
  };

  if (participantA < participantB) {
    mapping.participantA = participantB;
    mapping.participantB = participantA;
  }

  const UserRelation = {
    ...mapping,
    requestedBy: participantA,
    relationType: relationType,
    role: role,
    status,
  };

  const newUserRelation = await UserRelations.create(UserRelation);
  const userRelationId = newUserRelation?._id?.toString();

  if (!newUserRelation || !userRelationId) {
    return false;
  }

  return newUserRelation;
};

export const updateUserRelation = async (data: any) => {
  const {
    relationType = null,
    participantB = null,
    participantA = null,
    role = null,
    status = null,
  } = data;
  let dataToUpdate = {};

  if (status) {
    dataToUpdate = { status };
  }

  if (relationType == 'group' && role) {
    dataToUpdate = { ...dataToUpdate, role };
  }

  if (
    Object.keys(dataToUpdate).length == 0 ||
    !relationType ||
    !participantB ||
    !participantA
  ) {
    return false;
  }

  const updateUserRelation = await UserRelations.updateOne(
    { participantA, relationType, participantB },
    { $set: { ...dataToUpdate } },
    { runValidators: true },
  );

  if (!updateUserRelation || updateUserRelation?.matchedCount == 0) {
    return false;
  }

  return updateUserRelation;
};

export const updateUserRelationById = async (data: any) => {
  const { _id = null, role = null, status = null, relationType = null } = data;
  let dataToUpdate = {};
  if (status) {
    dataToUpdate = { status };
  }

  if (relationType == 'group' && role) {
    dataToUpdate = { ...dataToUpdate, role };
  }

  const updateUserRelation = await UserRelations.updateOne(
    { _id },
    { $set: { ...dataToUpdate } },
    { runValidators: true },
  );

  if (!updateUserRelation || updateUserRelation?.matchedCount == 0) {
    return false;
  }

  return updateUserRelation;
};

export const getUserRelations = async (data: any) => {
  const {
    relationType = null,
    participantA = null,
    limit = 10,
    page = 0,
    status = null,
  } = data;

  if (!participantA) {
    return false;
  }

  const userRelations = await UserRelations.find({
    ...(relationType ? { relationType } : {}),
    $or: [{ participantA: participantA }, { participantB: participantA }],
    ...(status ? { status } : { status: { $ne: 'blocked' } }),
  })
    .sort({ createdAt: -1 })
    .skip(page * limit)
    .limit(limit);

  if (!userRelations) {
    return false;
  }

  return userRelations;
};

export const deleteUserRelation = async (data: any) => {
  const {
    relationType = null,
    participantB = null,
    participantA = null,
  } = data;

  if (!relationType || !participantB || !participantA) {
    return false;
  }

  const deletedUserRelation = await UserRelations.deleteOne({
    participantA,
    participantB,
    relationType,
  });

  if (!deletedUserRelation || deletedUserRelation?.deletedCount == 0) {
    return false;
  }

  return deletedUserRelation;
};

export const updateUserRelationStatus = async (data: any) => {
  const { participant1 = null, participant2 = null, status = null } = data;

  logger.info('Relation Status Update : ', data);

  if (!participant1 || !participant2 || !status) {
    return false;
  }

  const updateStatus = await UserRelations.updateOne(
    {
      $or: [
        { participantA: participant1, participantB: participant2 },
        { participantA: participant2, participantB: participant1 },
      ],
    },
    { $set: { status } },
    { runValidators: true },
  );

  if (!updateStatus || updateStatus?.matchedCount == 0) {
    return false;
  }

  return updateStatus;
};

export const updateLastMessageAndUnreadCount = async (data: any) => {
  const { receiver = null, sender = null, count = 1, message = null } = data;

  let unreadMessages = null;
  let lastMessage = null;

  if (receiver < sender) {
    unreadMessages = { 'unreadMessages.participantA': count };
    lastMessage = { 'lastMessage.participantA': message };
  } else {
    unreadMessages = { 'unreadMessages.participantB': count };
    lastMessage = { 'lastMessage.participantB': message };
  }

  const updatedRelation = await UserRelations.updateOne(
    {
      $or: [
        { participantA: receiver, participantB: sender },
        { participantA: sender, participantB: receiver },
      ],
    },
    {
      $inc: unreadMessages,
      $set: lastMessage,
    },
  );

  if (!updatedRelation || updatedRelation?.matchedCount == 0) {
    return false;
  }

  return updatedRelation;
};

export default {
  createUserRelation,
  updateUserRelation,
  getUserRelations,
  deleteUserRelation,
  updateUserRelationStatus,
  updateLastMessageAndUnreadCount,
};
