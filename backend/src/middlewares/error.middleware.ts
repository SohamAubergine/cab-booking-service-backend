import { Request, Response, NextFunction } from "express";
import { APIError } from "../utils/customError";
import { MESSAGES } from "../utils/messages";
import { STATUS_CODES } from "../utils/statusCodes";
import { APIResponse } from "../utils/responseGenerator";
import { JsonWebTokenError, TokenExpiredError } from "jsonwebtoken";
import { ZodError } from "zod";

export const errorConverter = (
  error: any,
  _req: Request,
  _res: Response,
  next: NextFunction
): void => {
  let err: APIError;

  console.log("Error : ", error);

  switch (true) {
    case error.isOperational:
      err = error;
      break;
    case error instanceof ZodError:
      err = new APIError(
        STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
        MESSAGES.VALIDATION_ERR,
        false,
        error
      );
      break;
    case error instanceof TokenExpiredError:
      err = new APIError(
        STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED,
        MESSAGES.TOKEN_EXPIRED,
        false,
        error
      );
      break;
    case error instanceof JsonWebTokenError:
      err = new APIError(
        STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED,
        MESSAGES.INVALID("Token"),
        false,
        error
      );
      break;
    case error.name === "PrismaClientKnownRequestError":
      err = new APIError(
        STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
        MESSAGES.DATABASE_ERROR,
        false,
        error
      );
      break;
    default:
      err = new APIError(
        STATUS_CODES.SERVER_ERROR.INTERNAL_SERVER_ERROR,
        MESSAGES.ERROR,
        false,
        error
      );
      break;
  }
  next(err);
};

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export const errorHandler = (
  error: APIError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  console.error(error);

  if (error.message === MESSAGES.TOKEN_EXPIRED) {
    res.status(error.status).json(
      APIResponse.sendError({
        message: error.message,
        data: { expired: true },
      })
    );
  } else if (error.message === MESSAGES.VALIDATION_ERR) {
    // Extract validation error details from Zod
    const errorDetails =
      error.initialError instanceof ZodError
        ? error.initialError.errors
            .map((err) => `${err.path.join(".")}: ${err.message}`)
            .join(", ")
        : error.message;

    res.status(error.status).json(
      APIResponse.sendError({
        message: MESSAGES.VALIDATION_ERR,
        extra: { details: errorDetails },
      })
    );
  } else {
    res.status(error.status).json(
      APIResponse.sendError({
        message: error.message,
        // Include stack trace only in development mode
        ...(process.env.NODE_ENV !== "production" && {
          extra: { stack: error.stack },
        }),
      })
    );
  }
};
