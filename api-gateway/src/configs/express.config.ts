import express, {
  urlencoded,
  json,
  Express,
  NextFunction,
  Response,
  Request,
} from "express";
import cors from "cors";
import cookiParser from "cookie-parser";
import env from "./env.config";
import pageNotFound from "./404.config";
import { syntaxErrorHandler } from "../middlewares/error-handler.middleware";
import { createProxyMiddleware } from "http-proxy-middleware";
import authenticate from "../middlewares/jwt.middleware";
import docRoute from "../routes/docs.route";

let app: null | Express = null;
export function getExpressApp() {
  if (!app) {
    app = express();
  }

  return app;
}

export function includeExpressMiddleware(app: Express) {
  //body parser
  app.use(cookiParser());
  // app.use(json());
  app.use(urlencoded({ extended: false }));
  app.use(syntaxErrorHandler);
  const allowedOrigins = env.ALLOWED_ORIGINS?.split(",").map((o) => o.trim());
  app.use(
    cors({
      origin: (origin, callback) => {
        if (!origin) return callback(null, true);
        if (allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
          return callback(null, true);
        }
        callback(new Error("Not allowed by CORS"));
      },
      credentials: true,
    }),
  );
  app.options("/{*any}", cors());
  app.use("/api", authenticate);
}

export function includeExpressRoutes(app: Express) {
  app.use("/docs", docRoute);
  app.use(
    "/api/user",
    createProxyMiddleware({
      target: env.AUTH_SERVICE,
      changeOrigin: true,
      pathRewrite: (path, req) => {
        console.log("Inside it MOHIT", path);

        // Rewrite rules
        if (path.startsWith("/auth")) {
          return path;
        }

        return `/user${path}`;
      },
    }),
  );

  app.use(
    "/api/chat",
    createProxyMiddleware({
      target: env.CHAT_SERVICE, // nginx will be running on port 80
      changeOrigin: true,
      pathRewrite: {
        "/": "/chat/",
      },
    }),
  );

  app.all("/{*any}", pageNotFound);
}

export function startExpressAppServer(app: Express) {
  const PORT: string = env.PORT;
  app.listen(PORT, () => {
    console.log(`API Gateway is running on port:${PORT}`);
  });
}
