import { getExpressApp } from "./express";
import { Express } from "express";

const app: Express = getExpressApp();
// app.use((req, res, next) => {
//   const host = req.headers.host; // e.g., "sub.example.com"
//   const subdomain = host?.split(".")[0]; // Extract "sub"
//   req.subdomain = subdomain;
//   next();
// });
