import { Request, Response } from 'express'
import { catchAsync } from '../utils/wrapper'
import { ReviewService } from '../services'
import { STATUS_CODES } from '../utils/statusCodes'
import { APIResponse } from '../utils/responseGenerator'
import { MESSAGES } from '../utils/messages'
import { ReviewTypes, Pagination } from '../types'

/**
 * Submit a new review for a fitness class
 */
export const submitReview = catchAsync(async (req: Request, res: Response) => {
  // Get user ID from authenticated user
  const userId = req.user?.id

  if (!userId) {
    return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
      APIResponse.sendError({
        message: MESSAGES.AUTH.UNAUTHORIZED,
      })
    )
  }

  // Get review data from request body
  const reviewData = req.body as ReviewTypes.CreateReviewRequest

  // Create the review
  const review = await ReviewService.createReview(reviewData, userId)

  return res.status(STATUS_CODES.SUCCESS.CREATED).json(
    APIResponse.sendSuccess({
      message: MESSAGES.REVIEW.CREATED,
      data: review,
    })
  )
})

/**
 * Get reviews for a fitness class
 */
export const getClassReviews = catchAsync(
  async (req: Request, res: Response) => {
    // Get fitness class ID from request parameters
    const { fitnessClassId } = req.params

    // Parse pagination parameters with defaults
    const pagination: Pagination = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    }

    // Ensure pagination parameters are valid
    if (pagination.page < 1) pagination.page = 1
    if (pagination.limit < 1) pagination.limit = 10
    if (pagination.limit > 100) pagination.limit = 100

    // Get reviews for the class
    const result = await ReviewService.getClassReviews(
      fitnessClassId as string,
      pagination
    )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('Class reviews'),
        data: result,
      })
    )
  }
)

/**
 * Get rating summary for a fitness class
 */
export const getClassRatingSummary = catchAsync(
  async (req: Request, res: Response) => {
    // Get fitness class ID from request parameters
    const { fitnessClassId } = req.params

    // Get rating summary for the class
    const result = await ReviewService.getClassRatingSummary(
      fitnessClassId as string
    )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('Class rating summary'),
        data: result,
      })
    )
  }
)

/**
 * Get current user's review for a fitness class
 */
export const getUserReviewForClass = catchAsync(
  async (req: Request, res: Response) => {
    // Get user ID from authenticated user
    const userId = req.user?.id

    if (!userId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      )
    }

    // Get fitness class ID from request parameters
    const { fitnessClassId } = req.params

    // Get user's review for the class
    const review = await ReviewService.getUserReviewForClass(
      userId,
      fitnessClassId as string
    )

    if (!review) {
      return res.status(STATUS_CODES.CLIENT_ERROR.NOT_FOUND).json(
        APIResponse.sendError({
          message: MESSAGES.NOT_FOUND('Review'),
        })
      )
    }

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('User review'),
        data: review,
      })
    )
  }
)
