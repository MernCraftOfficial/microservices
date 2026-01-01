import { UserRelations } from '../model/UserRelations';

export const createUserRelation = async (data: any) => {
  const {
    userId = null,
    entityId = null,
    relationType = null,
    role = null,
  } = data;

  if (!relationType || !entityId || !userId) {
    return false;
  }

  const UserRelation = {
    userId: data?.userId,
    entityId: data?.entityId,
    relationType: data?.relationType,
    role: role,
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
    entityId = null,
    userId = null,
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
    !entityId ||
    !userId
  ) {
    return false;
  }

  const updateMessage = await UserRelations.updateOne(
    { userId, relationType, entityId },
    { $set: { ...dataToUpdate } },
    { runValidators: true },
  );

  if (!updateMessage || updateMessage?.matchedCount == 0) {
    return false;
  }

  return updateMessage;
};

export const getUserRelations = async (data: any) => {
  const {
    relationType = null,
    userId = null,
    limit = 50,
    page = 0,
    status = null,
  } = data;

  if (!userId) {
    return false;
  }

  const userRelations = await UserRelations.find({
    ...(relationType ? { relationType } : {}),
    userId,
    ...(status ? { status } : {}),
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
  const { relationType = null, entityId = null, userId = null } = data;

  if (!relationType || !entityId || !userId) {
    return false;
  }

  const deletedUserRelation = await UserRelations.deleteOne({
    userId,
    entityId,
    relationType,
  });

  if (!deletedUserRelation || deletedUserRelation?.deletedCount == 0) {
    return false;
  }

  return deletedUserRelation;
};

export default {
  createUserRelation,
  updateUserRelation,
  getUserRelations,
  deleteUserRelation,
};
