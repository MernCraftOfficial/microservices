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

export function startHttpServer(server: Server) {
  const PORT: string = env.PORT;
  server.listen(PORT, () => {
    console.log(`Listening HTTP Server on port:${PORT}`);
  });
}
