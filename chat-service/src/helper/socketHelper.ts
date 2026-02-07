export function getChatSocketKey(uniqueId: string) {
  return `service:chat;user:${uniqueId}`;
}
