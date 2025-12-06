import { createServer, Server } from 'http';
import { getExpressApp } from './express';
import env from './env';
let httpServer: Server | null = null;

export function getHttpServerInstance() {
  if (!httpServer) {
    const app = getExpressApp();
    httpServer = createServer(app);
  }

  return httpServer;
}

export function startHttpServer() {
  const PORT: string = env.PORT;
  const server: Server = getHttpServerInstance();
  server.listen(PORT, () => {
    console.log(`Chat Service is running at http://localhost:${PORT}`);
  });
}
