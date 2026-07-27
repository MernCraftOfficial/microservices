import jwt from "jsonwebtoken";
import { Response, NextFunction } from "express";
import env from "../configs/env.config";
import response from "../helpers/response.helper";
import { retrieveJwtToken } from "../helpers/common.helper";
import { signPayload } from "../helpers/crypto.helper";
import { JwtRequest } from "../types/common.type";
const authenticate = (req: JwtRequest, res: Response, next: NextFunction) => {
  //get the user from jwt and add id to req object
  try {
    const path = req.originalUrl;

    // Skip authentication for public routes
    if (path.includes("/public/")) {
      return next();
    }

    let token = retrieveJwtToken(req?.header("authorization"));
    const cookieKey = env.COOKIE_KEYS.jwt_token;

    if (!token && req?.cookies) {
      token = req?.cookies[cookieKey];
    }

    if (!token) {
      response.sendErrorResponse(
        res,
        "UNAUTHORIZED",
        "Authenticate using a valid token!",
      );
      return;
    }

    const userData = jwt.verify(token, env.JWT_AUTH_SECRET);

    if (!userData || typeof userData == "string") {
      response.sendErrorResponse(res, "BAD_REQUEST", "Token does not match!");
      return;
    }

    req.headers["x-user"] = JSON.stringify(userData);
    req.headers["x-user-signature"] = signPayload(
      JSON.stringify(userData),
      env.GATEWAY_SECRET,
    );

    next();
  } catch (error: any) {
    response.sendServerError(res, "UNAUTHORIZED", error.message);
    return;
  }
};

export default authenticate;
