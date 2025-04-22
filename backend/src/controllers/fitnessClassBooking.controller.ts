import { Request, Response } from 'express'
import { catchAsync } from '../utils/wrapper'
import { FitnessClassBookingService, FitnessClassService } from '../services'
import { STATUS_CODES } from '../utils/statusCodes'
import { APIResponse } from '../utils/responseGenerator'
import { MESSAGES } from '../utils/messages'
import { Pagination } from '../types'

/**
 * Book a fitness class for the currently logged-in user
 */
export const bookFitnessClass = catchAsync(
  async (req: Request, res: Response) => {
    // Get the fitness class ID from the request parameters
    const { fitnessClassId } = req.params

    // Get user ID from authenticated user
    const userId = req.user?.id

    if (!userId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      )
    }

    // Check if fitness class exists and is available (starts after 1 hour from now)
    const fitnessClass = await FitnessClassService.fetchFitnessClass({
      id: fitnessClassId as string, // Type assertion since we know fitnessClassId is a string
    })

    if (!fitnessClass) {
      return res.status(STATUS_CODES.CLIENT_ERROR.NOT_FOUND).json(
        APIResponse.sendError({
          message: MESSAGES.NOT_FOUND('Fitness class'),
        })
      )
    }

    // Check if the class starts at least 1 hour from now
    const now = new Date()
    const oneHourFromNow = new Date(now)
    oneHourFromNow.setHours(oneHourFromNow.getHours() + 1)

    if (fitnessClass.startsAt <= oneHourFromNow) {
      return res.status(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST).json(
        APIResponse.sendError({
          message: MESSAGES.BOOKING.CLASS_TOO_SOON,
        })
      )
    }

    // Create the booking
    const booking = await FitnessClassBookingService.createBooking({
      userId: userId, // Explicit assignment to remove any ambiguity
      fitnessClassId: fitnessClassId as string,
    })

    return res.status(STATUS_CODES.SUCCESS.CREATED).json(
      APIResponse.sendSuccess({
        message: MESSAGES.BOOKING.CREATED,
        data: booking,
      })
    )
  }
)

/**
 * Get all bookings for the currently logged-in user with pagination and filtering
 */
export const getUserBookings = catchAsync(
  async (req: Request, res: Response) => {
    // Get the user's ID from the request
    const userId = req.user?.id

    if (!userId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      )
    }

    // Parse pagination parameters with defaults
    const pagination: Pagination = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    }

    // Ensure pagination parameters are valid
    if (pagination.page < 1) pagination.page = 1
    if (pagination.limit < 1) pagination.limit = 10
    if (pagination.limit > 100) pagination.limit = 100

    // Get bookings for the user with pagination
    const result = await FitnessClassBookingService.getUserBookings(
      userId,
      pagination
    )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('User bookings'),
        data: result,
      })
    )
  }
)
