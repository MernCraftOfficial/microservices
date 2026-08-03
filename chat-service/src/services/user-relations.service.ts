import userRelationRepository from '../repositories/user-relations.repository';

class UserRelationService {
  async resetUnreadCount(receiver: string, sender: string) {
    userRelationRepository.resetUnreadCount(receiver, sender);
  }
}

const userRelationService = new UserRelationService();
export default userRelationService;
