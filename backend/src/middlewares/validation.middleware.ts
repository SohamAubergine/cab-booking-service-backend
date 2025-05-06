import { Request, Response, NextFunction } from "express";
import { ZodSchema } from "zod";
import { STATUS_CODES } from "../utils/statusCodes";
import { MESSAGES } from "../utils/messages";
import { APIResponse } from "../utils/responseGenerator";

type ValidationSchema = {
  body?: ZodSchema;
  query?: ZodSchema;
  params?: ZodSchema;
};

export const validateRequest = (schema: ValidationSchema) => {
  return (req: Request, res: Response, next: NextFunction) => {
    try {
      // Validate request body if schema provided
      if (schema.body) {
        req.body = schema.body.parse(req.body);
      }

      // Validate query parameters if schema provided
      if (schema.query) {
        req.query = schema.query.parse(req.query);
      }

      // Validate route parameters if schema provided
      if (schema.params) {
        req.params = schema.params.parse(req.params);
      }

      next();
    } catch (error: any) {
      const errorDetails =
        error.errors?.map((err: any) => err.message).join(", ") ||
        "Validation error";

      res.status(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST).json(
        APIResponse.sendError({
          message: MESSAGES.VALIDATION_ERR,
          data: null,
          extra: { details: errorDetails },
        })
      );
    }
  };
};
