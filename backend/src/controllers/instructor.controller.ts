import { Request, Response } from "express";
import { catchAsync } from "../utils/wrapper";
import { InstructorService } from "../services";
import { STATUS_CODES } from "../utils/statusCodes";
import { APIResponse } from "../utils/responseGenerator";
import { MESSAGES } from "../utils/messages";
import { Pagination } from "../types";

/**
 * Get all classes for which the authenticated user is an instructor
 */
export const getInstructorClasses = catchAsync(
  async (req: Request, res: Response) => {
    // Get instructor ID from authenticated user
    const instructorId = req.user?.id;

    if (!instructorId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      );
    }

    // Parse pagination parameters with defaults
    const pagination: Pagination = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    // Ensure pagination parameters are valid
    if (pagination.page < 1) pagination.page = 1;
    if (pagination.limit < 1) pagination.limit = 10;
    if (pagination.limit > 100) pagination.limit = 100;

    // Get classes for the instructor with pagination
    const result = await InstructorService.fetchInstructorClasses(
      instructorId,
      pagination
    );

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS("Instructor classes"),
        data: result,
      })
    );
  }
);

/**
 * Get all instructors (admin only)
 */
export const getAllInstructors = catchAsync(
  async (req: Request, res: Response) => {
    // Parse pagination parameters with defaults
    const pagination: Pagination = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    };

    // Get name search parameter if provided
    const nameSearch = req.query.name ? String(req.query.name) : undefined;

    // Ensure pagination parameters are valid
    if (pagination.page < 1) pagination.page = 1;
    if (pagination.limit < 1) pagination.limit = 10;
    if (pagination.limit > 100) pagination.limit = 100;

    // Get all instructors with pagination and optional name search
    const result = await InstructorService.fetchAllInstructors(
      pagination,
      nameSearch
    );

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS("Instructors"),
        data: result,
      })
    );
  }
);

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
    const result = await InstructorService.getInstructorGyms(
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
