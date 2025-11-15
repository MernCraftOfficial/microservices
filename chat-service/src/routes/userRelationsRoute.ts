import { Router } from 'express';
import {
  createUserRelation,
  deleteUserRelationByEntityId,
  getUserRelations,
  updateUserRelationByEntityId,
} from '../controller/userRelationsController';

const userRelationRoute = Router();

userRelationRoute.post('/userRelations', createUserRelation);
userRelationRoute.get('/userRelations', getUserRelations);
userRelationRoute.delete(
  '/userRelations/:relationType/:entityId',
  deleteUserRelationByEntityId,
);
userRelationRoute.patch(
  '/userRelations/:relationType/:entityId',
  updateUserRelationByEntityId,
);

export default userRelationRoute;
