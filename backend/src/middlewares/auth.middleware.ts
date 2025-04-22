import { Request, Response, NextFunction } from "express";
import jwt from "jsonwebtoken";
import { CONSTANTS } from "../utils/constants";
import { MESSAGES } from "../utils/messages";
import { STATUS_CODES } from "../utils/statusCodes";
import { APIResponse } from "../utils/responseGenerator";
import { AuthTypes } from "../types";

/**
 * Middleware to verify JWT token and attach user to request
 */
export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader) {
    res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
      APIResponse.sendError({
        message: MESSAGES.AUTH.TOKEN_MISSING,
      })
    );
    return;
  }

  const parts = authHeader.split(" ");
  if (parts.length !== 2) {
    res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
      APIResponse.sendError({
        message: MESSAGES.AUTH.TOKEN_INVALID,
      })
    );
    return;
  }

  const token = parts[1];

  if (!token) {
    res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
      APIResponse.sendError({
        message: MESSAGES.AUTH.TOKEN_MISSING,
      })
    );
    return;
  }

  try {
    // Use type assertion to handle the JWT payload
    const decoded = jwt.verify(
      token,
      CONSTANTS.AUTH.JWT.SECRET
    ) as unknown as AuthTypes.JwtPayload;

    req.user = decoded;

    next();
  } catch (error) {
    res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
      APIResponse.sendError({
        message: MESSAGES.AUTH.TOKEN_INVALID,
      })
    );
    return;
  }
};

/**
 * Middleware to check if user has required role
 */
export const hasRole = (roles: string[]) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      );
      return;
    }

    if (!roles.includes(req.user.role)) {
      res.status(STATUS_CODES.CLIENT_ERROR.FORBIDDEN).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.FORBIDDEN,
        })
      );
      return;
    }

    next();
  };
};

/**
 * Middleware to check if user is requesting their own data or is an admin
 */
export const isSelfOrAdmin = (
  req: Request,
  res: Response,
  next: NextFunction
): void => {
  if (!req.user) {
    res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
      APIResponse.sendError({
        message: MESSAGES.AUTH.UNAUTHORIZED,
      })
    );
    return;
  }

  // Allow access if user is requesting their own data or is an admin
  if (
    req.user.userId === req.params.userId ||
    req.user.role === CONSTANTS.AUTH.ROLES.ADMIN
  ) {
    next();
    return;
  }

  res.status(STATUS_CODES.CLIENT_ERROR.FORBIDDEN).json(
    APIResponse.sendError({
      message: MESSAGES.AUTH.FORBIDDEN,
    })
  );
};
