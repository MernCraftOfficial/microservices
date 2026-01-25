import { UserRelations } from '../model/UserRelations';

export const createUserRelation = async (data: any) => {
  let status = 'pending';
  const {
    userId = null,
    entityId = null,
    relationType = null,
    role = null,
  } = data;

  if (!relationType || !entityId || !userId) {
    return false;
  }

  if (userId == entityId) {
    status = 'accepted';
  }

  const UserRelation = {
    userId: data?.userId,
    entityId: data?.entityId,
    relationType: data?.relationType,
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

  const updateUserRelation = await UserRelations.updateOne(
    { userId, relationType, entityId },
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
    userId = null,
    limit = 10,
    page = 0,
    status = null,
  } = data;

  if (!userId) {
    return false;
  }

  const userRelations = await UserRelations.find({
    ...(relationType ? { relationType } : {}),
    $or: [{ userId }, { entityId: userId }],
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

export const updateUserRelationStatus = async (data: any) => {
  const { _id = null, status = null, entityId = null } = data;

  if (!_id || !status || !entityId) {
    return false;
  }

  const updateStatus = await UserRelations.updateOne(
    { _id, $or: [{ userId: entityId }, { entityId }] },
    { $set: { status } },
    { runValidators: true },
  );

  if (!updateStatus || updateStatus?.matchedCount == 0) {
    return false;
  }

  return updateStatus;
};

export default {
  createUserRelation,
  updateUserRelation,
  getUserRelations,
  deleteUserRelation,
  updateUserRelationStatus,
};
