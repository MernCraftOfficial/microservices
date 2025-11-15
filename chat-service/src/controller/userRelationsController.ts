import { NextFunction, Response } from 'express';
import tryCatchErrorHandler from '../helper/tryCatchHelper';
import response from '../helper/responseHelper';
import { JwtRequest } from '../types/commonTypes';
import UserRelationsRepository from '../repository/userRelationsRepository';

export const createUserRelation = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const userId = req?.user?._id;
    let userRelation = req?.body;

    if (userRelation?.relationType == 'friend') {
      userRelation.role = null;
    } else {
      userRelation.role = 'member';
    }

    userRelation = { ...userRelation, userId };

    try {
      const newUserRelation =
        await UserRelationsRepository.createUserRelation(userRelation);

      if (!newUserRelation) {
        response.sendErrorResponse(
          res,
          'INTERNAL_SERVER_ERROR',
          'Something went wrong!',
        );
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
    const userId = req?.user?._id;
    const data = {
      userId,
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

      response.sendSuccessResponse(res, 'OK', userRelations);
      return;
    } catch (error: any) {
      response.sendErrorResponse(res, 'BAD_REQUEST', error.message);
      return;
    }
  },
);

export const deleteUserRelationByEntityId = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const relationType = req?.params?.relationType;
    const entityId = req?.params?.entityId;
    const userId = req?.user?._id;
    try {
      const deletedUserRelation =
        await UserRelationsRepository.deleteUserRelation({
          userId,
          relationType,
          entityId,
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

export const updateUserRelationByEntityId = tryCatchErrorHandler(
  async (req: JwtRequest, res: Response, next: NextFunction) => {
    const relationType = req?.params?.relationType;
    const entityId = req?.params?.entityId;
    const userId = req?.user?._id;
    const data = req?.body ?? {};
    try {
      const updateUserRelation =
        await UserRelationsRepository.updateUserRelation({
          userId,
          relationType,
          entityId,
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
