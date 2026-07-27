import { Response } from 'express';
import { StatusCodes, ReasonPhrases } from 'http-status-codes';

type statusKey = keyof typeof StatusCodes;
const response = {
  sendSuccessResponse: (
    res: Response,
    statusConstant: statusKey,
    responseData?: any,
  ) => {
    res.status(StatusCodes[statusConstant]).json({
      success: true,
      message: ReasonPhrases[statusConstant],
      data: responseData,
    });
  },
  sendErrorResponse: (
    res: Response,
    statusConstant: statusKey,
    responseData?: any,
  ) => {
    res.status(StatusCodes[statusConstant]).json({
      success: false,
      message: ReasonPhrases[statusConstant],
      data: responseData,
    });
  },
  sendServerError: (
    res: Response,
    statusConstant: statusKey,
    responseData?: any,
  ) => {
    res.status(StatusCodes[statusConstant]).json({
      success: false,
      message: ReasonPhrases[statusConstant],
      data: responseData,
    });
  },
};

export default response;
