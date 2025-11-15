import express, { NextFunction, Request, Response } from "express";

const { createProxyMiddleware } = require("http-proxy-middleware");

const app = express();

// Authentication layer
app.use((req: Request, res: Response, next: NextFunction) => {
  if (req.path.startsWith("/auth")) return next(); // open routes

  const token = req.headers.authorization;
  if (!token) return res.status(401).json({ message: "Unauthorized" });

  next();
});

// Gateway → Forward to NGINX (not directly to microservices)
app.use(
  "/chat",
  createProxyMiddleware({
    target: "http://localhost", // nginx will be running on port 80
    changeOrigin: true,
  })
);

app.use(
  "/auth",
  createProxyMiddleware({
    target: "http://localhost",
    changeOrigin: true,
  })
);

app.listen(3000, () => console.log("API Gateway running on port 3000"));
