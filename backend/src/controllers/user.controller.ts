import { Request, Response } from "express";
import { catchAsync } from "../utils/wrapper";
import { UserService } from "../services";
import { STATUS_CODES } from "../utils/statusCodes";
import { APIResponse } from "../utils/responseGenerator";
import { MESSAGES } from "../utils/messages";

/**
 * Get user by ID
 */
export const getUserById = catchAsync(async (req: Request, res: Response) => {
  const { userId } = req.params;

  // Get user by ID (will throw APIError if not found)
  const user = await UserService.getUserById(userId as string);

  return res.status(STATUS_CODES.SUCCESS.OK).json(
    APIResponse.sendSuccess({
      message: MESSAGES.RETRIEVE_SUCCESS("User"),
      data: user,
    })
  );
});

/**
 * Get all instructors
 */
export const getInstructors = catchAsync(
  async (_req: Request, res: Response) => {
    // Get all users with instructor role
    const instructors = await UserService.getInstructorUsers();

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS("Instructors"),
        data: instructors,
      })
    );
  }
);

/**
 * Get all users (admin only)
 */
export const getAllUsers = catchAsync(async (req: Request, res: Response) => {
  // Parse pagination and filter parameters
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
  const name = req.query.name ? String(req.query.name) : undefined;

  // Get users with pagination and filters
  const result = await UserService.getAllUsers({ page, limit, name });

  return res.status(STATUS_CODES.SUCCESS.OK).json(
    APIResponse.sendSuccess({
      message: MESSAGES.RETRIEVE_SUCCESS("Users"),
      data: result,
    })
  );
});

/**
 * Get recent user activity
 */
export const getUserActivity = catchAsync(
  async (req: Request, res: Response) => {
    // Get the authenticated user
    const userId = req.user?.id;

    if (!userId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      );
    }

    // Parse limit parameter
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 5;

    // Get recent user activity
    const activity = await UserService.getUserRecentActivity(userId, limit);

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS("User activity"),
        data: activity,
      })
    );
  }
);

/**
 * Get gyms owned by the current user
 */
export const getUserGyms = catchAsync(async (req: Request, res: Response) => {
  // Get the authenticated user
  const userId = req.user?.id;

  if (!userId) {
    return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
      APIResponse.sendError({
        message: MESSAGES.AUTH.UNAUTHORIZED,
      })
    );
  }

  // Parse pagination parameters
  const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
  const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;

  // Get user's gyms with pagination
  const result = await UserService.getUserGyms(userId, page, limit);

  return res.status(STATUS_CODES.SUCCESS.OK).json(
    APIResponse.sendSuccess({
      message: MESSAGES.RETRIEVE_SUCCESS("User gyms"),
      data: result,
    })
  );
});

/**
 * Get gyms for the current instructor
 */
export const getInstructorGyms = catchAsync(
  async (req: Request, res: Response) => {
    // Get the authenticated user
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      );
    }

    // Parse pagination parameters
    const page = req.query.page ? parseInt(req.query.page as string, 10) : 1;
    const limit = req.query.limit
      ? parseInt(req.query.limit as string, 10)
      : 10;

    // Get instructor's gyms with pagination
    const result = await UserService.getInstructorGyms(
      instructorId,
      page,
      limit
    );

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS("Instructor gyms"),
        data: result,
      })
    );
  }
);
