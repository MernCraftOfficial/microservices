import response from "../helpers/response.helper";
import tryCatchErrorHandler from "../helpers/try-catch.helper";
import { Request, Response, NextFunction } from "express";

const pageNotFound = tryCatchErrorHandler(
  async (req: Request, res: Response, next: NextFunction) => {
    const fullUrl = req.protocol + "://" + req.get("host") + req.originalUrl;

    response.sendErrorResponse(
      res,
      "NOT_FOUND",
      `${fullUrl}: Route cannot be found!`,
    );
    return;
  },
);

export default pageNotFound;
