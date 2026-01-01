import express, { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";
import env from "./config/env";

const app = express();

// Authentication layer
// app.use((req: Request, res: Response, next: NextFunction) => {
//   if (req.path.startsWith("/auth")) return next(); // open routes

//   const token = req.headers.authorization;
//   if (!token) return res.status(401).json({ message: "Unauthorized" });

//   next();
// });

// Gateway → Forward to NGINX (not directly to microservices)
app.use(
  "/user",
  createProxyMiddleware({
    target: env.AUTH_SERVICE,
    changeOrigin: true,
    pathRewrite: {
      "/": "/user/",
    },
  })
);

app.use(
  "/chat",
  createProxyMiddleware({
    target: env.CHAT_SERVICE, // nginx will be running on port 80
    changeOrigin: true,
    pathRewrite: {
      "/": "/chat/",
    },
  })
);

app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Route not found",
    path: req.originalUrl,
  });
});

app.listen(env.PORT, () =>
  console.log(`API Gateway running on port:${env.PORT}`)
);
