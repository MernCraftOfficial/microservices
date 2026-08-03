import logger from '../configs/winston.config';
import { getParticipantOrder } from '../helpers/user-relations.helper';
import { UserRelations } from '../models/user-relations.model';

class UserRelationRepository {
  async createUserRelation(data: any) {
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
  }

  async updateUserRelation(data: any) {
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
  }

  async updateUserRelationById(data: any) {
    const {
      _id = null,
      role = null,
      status = null,
      relationType = null,
    } = data;

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
  }

  async getUserRelations(data: any) {
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
  }

  async deleteUserRelation(data: any) {
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
  }

  async updateUserRelationStatus(data: any) {
    const { participant1 = null, participant2 = null, status = null } = data;

    logger.info('Relation Status Update : ', data);

    if (!participant1 || !participant2 || !status) {
      return false;
    }

    const updateStatus = await UserRelations.updateOne(
      {
        $or: [
          {
            participantA: participant1,
            participantB: participant2,
          },
          {
            participantA: participant2,
            participantB: participant1,
          },
        ],
      },
      { $set: { status } },
      { runValidators: true },
    );

    if (!updateStatus || updateStatus?.matchedCount == 0) {
      return false;
    }

    return updateStatus;
  }

  async updateLastMessageAndUnreadCount(data: any) {
    const { receiver = null, sender = null, count = 1, message = null } = data;

    const isParticipantA = receiver < sender;

    const unreadMessages = {
      [isParticipantA
        ? 'unreadMessages.participantA'
        : 'unreadMessages.participantB']: count,
    };

    const lastMessage = {
      [isParticipantA
        ? 'lastMessage.participantA'
        : 'lastMessage.participantB']: message,
    };

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

    if (!updatedRelation || updatedRelation.matchedCount === 0) {
      return false;
    }

    return updatedRelation;
  }

  async resetUnreadCount(receiver: string, sender: string) {
    const { participantA, participantB, isFirstParticipantA } =
      getParticipantOrder(receiver, sender);

    const unreadMessages = isFirstParticipantA
      ? { 'unreadMessages.participantB': 0 }
      : { 'unreadMessages.participantA': 0 };

    const updatedRelation = await UserRelations.updateOne(
      { participantA, participantB },
      { $set: unreadMessages },
    );

    return updatedRelation;
  }
}

const userRelationRepository = new UserRelationRepository();

export default userRelationRepository;
