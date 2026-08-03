export function getParticipantOrder(user1: string, user2: string) {
  const participantA = user1 > user2 ? user1 : user2;
  const participantB = user1 > user2 ? user2 : user1;

  return {
    participantA,
    participantB,
    isFirstParticipantA: participantA === user1,
  };
}
