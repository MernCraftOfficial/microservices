import { Router } from 'express';
import {
  createUserRelation,
  deleteUserRelationByParticipantB,
  getUserRelations,
  updateUserRelationByParticipantB,
  rejectRequest,
  acceptRequest,
} from '../controllers/user-relations.controller';

const userRelationRoute = Router();

userRelationRoute.post('/userRelations', createUserRelation);
userRelationRoute.get('/userRelations', getUserRelations);
userRelationRoute.delete(
  '/userRelations/:relationType/:entityId',
  deleteUserRelationByParticipantB,
);
userRelationRoute.patch(
  '/userRelations/:relationType/:entityId',
  updateUserRelationByParticipantB,
);

userRelationRoute.patch('/userRelations/block', rejectRequest);
userRelationRoute.patch('/userRelations/accept', acceptRequest);

export default userRelationRoute;
