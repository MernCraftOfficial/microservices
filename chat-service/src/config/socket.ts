import { Server } from "socket.io";
import { getHttpServerInstance } from "./http";

let io: Server | null = null;
export function getSocketInstance() {
  if (!io) {
    const httpServer = getHttpServerInstance();
    io = new Server(httpServer, {
      cors: {
        origin: "*",
        methods: ["GET", "POST"],
      },
    });
  }
  return io;
}

export function createSocketNamespace(namespace: string) {
  const io = getSocketInstance();
  return io.of(namespace);
}
