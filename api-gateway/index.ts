import express, { NextFunction, Request, Response } from "express";
import { createProxyMiddleware } from "http-proxy-middleware";

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
    target: "http://localhost:5001",
    changeOrigin: true,
    pathRewrite: {
      "/": "/user/",
    },
  })
);

app.use(
  "/chat",
  createProxyMiddleware({
    target: "http://localhost:5002", // nginx will be running on port 80
    changeOrigin: true,
    pathRewrite: {
      "/": "/chat/",
    },
  })
);

app.listen(5000, () => console.log("API Gateway running on port 5000"));
