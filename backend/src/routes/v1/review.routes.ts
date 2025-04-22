import { Router } from 'express'
import { ReviewController } from '../../controllers'
import { authenticate } from '../../middlewares/auth.middleware'
import { validate } from '../../middlewares/validations.middleware'
import { ReviewSchema } from '../../schemas'

const reviewRouter = Router()

/**
 * @route POST /api/v1/reviews
 * @desc Submit a review for a fitness class
 * @access Authenticated users
 */
reviewRouter.post(
  '/',
  authenticate,
  validate(ReviewSchema.createReviewSchema),
  ReviewController.submitReview
)

/**
 * @route GET /api/v1/reviews/classes/:fitnessClassId
 * @desc Get all reviews for a fitness class with pagination
 * @access Authenticated users
 */
reviewRouter.get(
  '/classes/:fitnessClassId',
  authenticate,
  ReviewController.getClassReviews
)

/**
 * @route GET /api/v1/reviews/classes/:fitnessClassId/summary
 * @desc Get rating summary for a fitness class
 * @access Authenticated users
 */
reviewRouter.get(
  '/classes/:fitnessClassId/summary',
  authenticate,
  ReviewController.getClassRatingSummary
)

/**
 * @route GET /api/v1/reviews/classes/:fitnessClassId/user
 * @desc Get the current user's review for a fitness class
 * @access Authenticated users
 */
reviewRouter.get(
  '/classes/:fitnessClassId/user',
  authenticate,
  ReviewController.getUserReviewForClass
)

export default reviewRouter
