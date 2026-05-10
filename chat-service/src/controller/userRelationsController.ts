import { NextFunction, Response } from 'express';
import tryCatchErrorHandler from '../helper/tryCatchHelper';
import response from '../helper/responseHelper';
import { JwtRequest } from '../types/commonTypes';
import UserRelationsRepository from '../repository/userRelationsRepository';
import userService from '../services/userService';
import { getChatSocket } from '../sockets/chatSocket';
import { getChatSocketKey } from '../helper/socketHelper';
import logger from '../config/winston';

export const createUserRelation: any = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const participantA = req?.user?._id;
    let userRelation = req?.body;

    if (userRelation?.relationType == 'friend') {
      userRelation.role = null;
    } else {
      userRelation.role = 'member';
    }

    userRelation = { ...userRelation, participantA };

    try {
      const newUserRelation =
        await UserRelationsRepository.createUserRelation(userRelation);

      if (!newUserRelation) {
        response.sendErrorResponse(
          res,
          'INTERNAL_SERVER_ERROR',
          'Something went wrong!',
        );
        return;
      }

      const userServiceResponse = await userService.getFriendsDataByIds([
        userRelation?.participantA,
        userRelation?.participantB,
      ]);

      logger.info('createUserRelation : ', userServiceResponse);

      const relationData = {
        relationId: newUserRelation?._id,
        requestedBy: newUserRelation?.requestedBy,
        requestStatus: newUserRelation?.status,
      };

      if (userServiceResponse.success) {
        const chatSocket = getChatSocket();
        chatSocket
          .to(getChatSocketKey(userRelation?.participantA))
          .emit('friendRequest', {
            ...userServiceResponse?.data?.filter((user: any) => {
              if (user?._id != userRelation?.participantA) {
                return true;
              }
              return false;
            })?.[0],
            ...relationData,
          });
        chatSocket
          .to(getChatSocketKey(userRelation?.participantB))
          .emit('friendRequest', {
            ...relationData,
            ...userServiceResponse?.data?.filter((user: any) => {
              if (user?._id != userRelation?.participantB) {
                return true;
              }
              return false;
            })?.[0],
          });
      }

      response.sendSuccessResponse(res, 'CREATED', newUserRelation);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);

export const getUserRelations = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const participantA = req?.user?._id;
    const data = {
      participantA,
      relationType: req?.query?.relationType,
      page: req?.query?.page,
      limit: req?.query?.limit,
      status: req?.query?.status,
    };

    try {
      const userRelations =
        await UserRelationsRepository.getUserRelations(data);

      if (!userRelations) {
        response.sendErrorResponse(res, 'NOT_FOUND', 'No relations found!');
        return;
      }

      let ids: string[] = [];
      let responseData: any = userRelations?.map((relation) => {
        let unreadMessages = 0;
        let lastMessage = null;

        if (participantA == relation?.participantB?.toString()) {
          unreadMessages = relation?.unreadMessages?.participantA ?? 0;
          lastMessage = relation?.lastMessage?.participantA ?? null;
          ids.push(relation?.participantA?.toString());
        } else {
          unreadMessages = relation?.unreadMessages?.participantB ?? 0;
          lastMessage = relation?.lastMessage?.participantB ?? null;
          ids.push(relation?.participantB?.toString());
        }

        return {
          friend_id: ids[ids?.length - 1],
          relationId: relation?._id?.toString(),
          requestedBy: relation?.requestedBy,
          requestStatus: relation?.status,
          unreadMessages,
          lastMessage,
        };
      });

      const userServiceResponse = await userService.getFriendsDataByIds(ids);

      if (userServiceResponse?.success) {
        responseData = userServiceResponse?.data?.map(
          (user: any, index: number) => {
            return {
              ...user,
              ...(responseData?.filter((relation: any) => {
                if (user?._id == relation?.friend_id) {
                  return true;
                }

                return false;
              })?.[0] ?? {}),
            };
          },
        );

        response.sendSuccessResponse(res, 'OK', responseData);
        return;
      }
      response.sendSuccessResponse(res, 'OK', userRelations);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);

export const deleteUserRelationByParticipantB = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const relationType = req?.params?.relationType;
    const participantB = req?.params?.participantB;
    const participantA = req?.user?._id;
    try {
      const deletedUserRelation =
        await UserRelationsRepository.deleteUserRelation({
          participantA,
          relationType,
          participantB,
        });

      if (!deletedUserRelation) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable to delete relation!',
        );
        return;
      }

      response.sendSuccessResponse(res, 'OK', deletedUserRelation);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const updateUserRelationByParticipantB = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const relationType = req?.params?.relationType;
    const participantB = req?.params?.participantB;
    const participantA = req?.user?._id;
    const data = req?.body ?? {};
    try {
      const updateUserRelation =
        await UserRelationsRepository.updateUserRelation({
          participantA,
          relationType,
          participantB,
          ...data,
        });

      if (!updateUserRelation) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable to delete relation!',
        );
        return;
      }

      response.sendSuccessResponse(res, 'OK', updateUserRelation);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const rejectRequest = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const participant1 = req?.user?._id;
    let data = req?.body ?? {};
    const participant2 = data?.participantId;
    if (!data?.relationId) {
      response.sendErrorResponse(
        res,
        'BAD_REQUEST',
        'Relation ID is not provided!',
      );
      return;
    }

    data = { participant2, participant1, status: 'blocked' };

    try {
      const updateUserRelation =
        await UserRelationsRepository.updateUserRelationStatus(data);

      if (!updateUserRelation) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable to reject relation!',
        );
        return;
      }

      const chatSocket = getChatSocket();

      chatSocket
        .to(getChatSocketKey(participant1))
        .emit('friendRequest', { _id: participant2, status: 'blocked' });
      chatSocket
        .to(getChatSocketKey(participant2))
        .emit('friendRequest', { _id: participant1, status: 'blocked' });

      response.sendSuccessResponse(res, 'OK', updateUserRelation);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);

export const acceptRequest = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const participant1 = req?.user?._id;
    let data = req?.body ?? {};
    const participant2 = data?.participantId;
    if (!participant2) {
      response.sendErrorResponse(
        res,
        'BAD_REQUEST',
        'Participant ID is not provided!',
      );
      return;
    }

    data = { participant2, participant1, status: 'accepted' };

    try {
      const updateUserRelation =
        await UserRelationsRepository.updateUserRelationStatus(data);

      if (!updateUserRelation) {
        response.sendErrorResponse(
          res,
          'BAD_REQUEST',
          'Unable to accept relation!',
        );
        return;
      }

      const chatSocket = getChatSocket();

      chatSocket
        .to(getChatSocketKey(participant1))
        .emit('friendRequest', { _id: participant2, status: 'accepted' });
      chatSocket
        .to(getChatSocketKey(participant2))
        .emit('friendRequest', { _id: participant1, status: 'accepted' });

      response.sendSuccessResponse(res, 'OK', updateUserRelation);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'INTERNAL_SERVER_ERROR', error.message);
    }
  },
);
