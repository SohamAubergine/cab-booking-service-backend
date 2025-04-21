import { Request, Response } from 'express'
import { catchAsync } from '../utils/wrapper'
import { FitnessClassService } from '../services'
import { STATUS_CODES } from '../utils/statusCodes'
import { APIResponse } from '../utils/responseGenerator'
import { MESSAGES } from '../utils/messages'
import { FitnessClassTypes, Pagination } from '../types'
import { Prisma } from '@prisma/client'
import { APIError } from '../utils/customError'
import prisma from '../config/db'

/**
 * Create a new fitness class
 */
export const createFitnessClass = catchAsync(
  async (req: Request, res: Response) => {
    const fitnessClassData =
      req.body as FitnessClassTypes.CreateFitnessClassRequest

    const fitnessClass = await FitnessClassService.createFitnessClass(
      fitnessClassData
    )

    return res.status(STATUS_CODES.SUCCESS.CREATED).json(
      APIResponse.sendSuccess({
        message: MESSAGES.FITNESS_CLASS.CREATED,
        data: fitnessClass,
      })
    )
  }
)

/**
 * Update an existing fitness class
 */
export const updateFitnessClass = catchAsync(
  async (req: Request, res: Response) => {
    // Get the fitness class ID from the request parameters
    const { fitnessClassId } = req.params

    // Get the update data from the request body
    const updateData =
      req.body as Partial<FitnessClassTypes.CreateFitnessClassRequest>

    // Format data for Prisma update
    const formattedData: Prisma.FitnessClassUpdateInput = {}

    // Add basic fields
    if (updateData.name) {
      formattedData.name = updateData.name
    }

    // Format dates if provided
    if (updateData.startsAt) {
      formattedData.startsAt = new Date(updateData.startsAt)
    }

    if (updateData.endsAt) {
      formattedData.endsAt = new Date(updateData.endsAt)
    }

    // Set up relations
    if (updateData.categoryId) {
      formattedData.category = {
        connect: { id: updateData.categoryId },
      }
    }

    if (updateData.instructorId) {
      formattedData.instructor = {
        connect: { id: updateData.instructorId },
      }
    }

    if (updateData.gymId) {
      formattedData.gym = {
        connect: { id: updateData.gymId },
      }
    }

    // Check for instructor conflicts if instructor or time is being changed
    if (
      (updateData.instructorId || updateData.startsAt || updateData.endsAt) &&
      (updateData.startsAt || updateData.endsAt)
    ) {
      const existingClass = await FitnessClassService.fetchFitnessClass({
        id: fitnessClassId as string,
      })

      if (!existingClass) {
        return res.status(STATUS_CODES.CLIENT_ERROR.NOT_FOUND).json(
          APIResponse.sendError({
            message: MESSAGES.NOT_FOUND('Fitness class'),
          })
        )
      }

      // Get instructor ID (either the updated one or the existing one)
      const instructorId = updateData.instructorId || existingClass.instructorId

      // Get start and end times (either the updated ones or the existing ones)
      const startsAt =
        updateData.startsAt || existingClass.startsAt.toISOString()
      const endsAt = updateData.endsAt || existingClass.endsAt.toISOString()

      // Only check conflicts if time or instructor is changing
      if (
        instructorId !== existingClass.instructorId ||
        startsAt !== existingClass.startsAt.toISOString() ||
        endsAt !== existingClass.endsAt.toISOString()
      ) {
        const hasConflicts = await FitnessClassService.checkInstructorConflicts(
          instructorId,
          startsAt,
          endsAt,
          fitnessClassId as string // Exclude current class from conflict check
        )

        if (hasConflicts) {
          return res.status(STATUS_CODES.CLIENT_ERROR.CONFLICT).json(
            APIResponse.sendError({
              message: MESSAGES.FITNESS_CLASS.INSTRUCTOR_CONFLICT,
            })
          )
        }
      }
    }

    // Update the fitness class
    const updatedFitnessClass = await FitnessClassService.updateFitnessClass(
      fitnessClassId as string,
      formattedData
    )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.FITNESS_CLASS.UPDATED,
        data: updatedFitnessClass,
      })
    )
  }
)

/**
 * Get all fitness classes with filtering and pagination
 */
export const getAllFitnessClasses = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query as FitnessClassTypes.FitnessClassQueryParams

    // Build filter conditions
    const filterConditions: Prisma.FitnessClassWhereInput = {}

    // Name search (case insensitive)
    if (query.name) {
      filterConditions.name = {
        contains: query.name,
        mode: 'insensitive',
      }
    }

    // Category filter
    if (query.categoryId) {
      filterConditions.categoryId = query.categoryId
    }

    // Instructor filter
    if (query.instructorId) {
      filterConditions.instructorId = query.instructorId
    }

    // Gym filter
    if (query.gymId) {
      filterConditions.gymId = query.gymId
    }

    // Date range filters
    if (query.startDateFrom || query.startDateTo) {
      filterConditions.startsAt = {}

      if (query.startDateFrom) {
        filterConditions.startsAt.gte = new Date(query.startDateFrom)
      }

      if (query.startDateTo) {
        filterConditions.startsAt.lte = new Date(query.startDateTo)
      }
    }

    // Parse pagination parameters with defaults
    const pagination: Pagination = {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
    }

    // Ensure pagination parameters are valid
    if (pagination.page < 1) pagination.page = 1
    if (pagination.limit < 1) pagination.limit = 10
    if (pagination.limit > 100) pagination.limit = 100

    // Get fitness classes with filters and pagination
    const result =
      await FitnessClassService.fetchFitnessClassesWithFiltersAndPagination(
        filterConditions,
        pagination
      )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('Fitness classes'),
        data: result,
      })
    )
  }
)

/**
 * Get available fitness classes for users
 * Only shows upcoming classes that have more than 1 hour to start
 * Excludes classes already booked by the current user
 */
export const getAvailableFitnessClasses = catchAsync(
  async (req: Request, res: Response) => {
    const query = req.query as FitnessClassTypes.FitnessClassQueryParams
    const userId = req.user?.id

    // Current time
    const now = new Date()

    // Calculate time threshold (current time + 1 hour)
    const oneHourFromNow = new Date(now)
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)

    // Build filter conditions with startsAt already defined as an object
    const filterConditions: Prisma.FitnessClassWhereInput = {
      // Only include classes that start after the one hour threshold
      startsAt: {
        gte: oneHourFromNow,
      },
    }

    // Name search (case insensitive)
    if (query.name) {
      filterConditions.name = {
        contains: query.name,
        mode: 'insensitive',
      }
    }

    // Category filter
    if (query.categoryId) {
      filterConditions.categoryId = query.categoryId
    }

    // Instructor filter
    if (query.instructorId) {
      filterConditions.instructorId = query.instructorId
    }

    // Gym filter
    if (query.gymId) {
      filterConditions.gymId = query.gymId
    }

    // Additional date range filter (if provided)
    if (query.startDateFrom) {
      // Ensure the start date is not before the one hour threshold
      const startDate = new Date(query.startDateFrom)
      if (startDate > oneHourFromNow) {
        // We know startsAt is an object with gte property already defined
        ;(filterConditions.startsAt as Prisma.DateTimeFilter).gte = startDate
      }
    }

    if (query.startDateTo) {
      // We know startsAt is an object because we defined it above
      ;(filterConditions.startsAt as Prisma.DateTimeFilter).lte = new Date(
        query.startDateTo
      )
    }

    // Parse pagination parameters with defaults
    const pagination: Pagination = {
      page: query.page ? parseInt(query.page, 10) : 1,
      limit: query.limit ? parseInt(query.limit, 10) : 10,
    }

    // Ensure pagination parameters are valid
    if (pagination.page < 1) pagination.page = 1
    if (pagination.limit < 1) pagination.limit = 10
    if (pagination.limit > 100) pagination.limit = 100

    // Get fitness classes with filters and pagination, excluding already booked classes
    const result = await FitnessClassService.fetchAvailableFitnessClasses(
      filterConditions,
      pagination,
      userId as string
    )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('Available fitness classes'),
        data: result,
      })
    )
  }
)

/**
 * Delete a fitness class
 */
export const deleteFitnessClass = catchAsync(
  async (req: Request, res: Response) => {
    // Get the fitness class ID from the request parameters
    const { fitnessClassId } = req.params

    try {
      // Delete the fitness class (validation handled in service)
      await FitnessClassService.deleteFitnessClass(fitnessClassId as string)

      return res.status(STATUS_CODES.SUCCESS.OK).json(
        APIResponse.sendSuccess({
          message: MESSAGES.FITNESS_CLASS.DELETED,
          data: null,
        })
      )
    } catch (error: unknown) {
      if (error instanceof APIError) {
        return res.status(error.status).json(
          APIResponse.sendError({
            message: error.message,
          })
        )
      }
      throw error
    }
  }
)

/**
 * Get fitness class by ID
 */
export const getFitnessClassById = catchAsync(
  async (req: Request, res: Response) => {
    const { fitnessClassId } = req.params

    const fitnessClass = await FitnessClassService.fetchFitnessClass({
      id: fitnessClassId as string,
    })

    if (!fitnessClass) {
      return res.status(STATUS_CODES.CLIENT_ERROR.NOT_FOUND).json(
        APIResponse.sendError({
          message: MESSAGES.NOT_FOUND('Fitness class'),
        })
      )
    }

    // Get booking count to show available spots
    const bookingsCount = await prisma.fitnessClassBooking.count({
      where: { fitnessClassId: fitnessClassId as string },
    })

    const availableSpots = fitnessClass.capacity - bookingsCount

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('Fitness class'),
        data: {
          ...fitnessClass,
          currentBookings: bookingsCount,
          availableSpots,
        },
      })
    )
  }
)

/**
 * Get all fitness class categories with pagination
 */
export const getFitnessClassCategories = catchAsync(
  async (req: Request, res: Response) => {
    // Parse pagination parameters with defaults
    const pagination: Pagination = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    }

    // Ensure pagination parameters are valid
    if (pagination.page < 1) pagination.page = 1
    if (pagination.limit < 1) pagination.limit = 10
    if (pagination.limit > 100) pagination.limit = 100

    const categories = await FitnessClassService.fetchFitnessClassCategories(
      pagination
    )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('Fitness class categories'),
        data: categories,
      })
    )
  }
)
