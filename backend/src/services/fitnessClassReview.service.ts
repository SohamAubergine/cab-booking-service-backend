import prisma from '../config/db'
import { Pagination, PaginatedResult, ReviewTypes } from '../types'
import { APIError } from '../utils/customError'
import { STATUS_CODES } from '../utils/statusCodes'
import { MESSAGES } from '../utils/messages'

// Define a custom interface for FitnessClassReview until we run migrations
interface FitnessClassReview {
  id: string
  rating: number
  feedback: string | null
  userId: string
  fitnessClassId: string
  createdAt: Date
  updatedAt: Date
  user?: {
    id: string
    name: string
  }
  fitnessClass?: {
    id: string
    name: string
  }
}

/**
 * Create a new fitness class review
 * @param reviewData Review data including rating, feedback, and fitness class ID
 * @param userId ID of the user submitting the review
 * @returns Created fitness class review
 */
export const createReview = async (
  reviewData: {
    rating: number
    feedback?: string | null
    fitnessClassId: string
  },
  userId: string
): Promise<FitnessClassReview> => {
  // Validate rating is between 1-5
  if (reviewData.rating < 1 || reviewData.rating > 5) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
      MESSAGES.REVIEW.INVALID_RATING,
      true
    )
  }

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('User'),
      true
    )
  }

  // Check if fitness class exists
  const fitnessClass = await prisma.fitnessClass.findUnique({
    where: { id: reviewData.fitnessClassId },
  })

  if (!fitnessClass) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('Fitness class'),
      true
    )
  }

  // Check if class has ended
  const now = new Date()
  if (fitnessClass.endsAt > now) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
      MESSAGES.REVIEW.CLASS_NOT_ENDED,
      true
    )
  }

  // Check if user has booked this class
  const booking = await prisma.fitnessClassBooking.findFirst({
    where: {
      userId: userId,
      fitnessClassId: reviewData.fitnessClassId,
    },
  })

  if (!booking) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
      MESSAGES.REVIEW.NOT_BOOKED,
      true
    )
  }

  // Check if review already exists
  const existingReview = await prisma.fitnessClassReview.findFirst({
    where: {
      userId: userId,
      fitnessClassId: reviewData.fitnessClassId,
    },
  })

  if (existingReview) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.CONFLICT,
      MESSAGES.REVIEW.EXISTS,
      true
    )
  }

  // Create the review
  const review = await prisma.fitnessClassReview.create({
    data: {
      rating: reviewData.rating,
      feedback: reviewData.feedback || null,
      user: {
        connect: { id: userId },
      },
      fitnessClass: {
        connect: { id: reviewData.fitnessClassId },
      },
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      fitnessClass: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return review
}

/**
 * Get reviews for a specific fitness class with pagination
 * @param fitnessClassId ID of the fitness class
 * @param pagination Pagination parameters
 * @returns Paginated result of fitness class reviews
 */
export const getClassReviews = async (
  fitnessClassId: string,
  pagination: Pagination
): Promise<PaginatedResult<FitnessClassReview>> => {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  // Check if fitness class exists
  const fitnessClass = await prisma.fitnessClass.findUnique({
    where: { id: fitnessClassId },
  })

  if (!fitnessClass) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('Fitness class'),
      true
    )
  }

  // Get total count for pagination metadata
  const totalItems = await prisma.fitnessClassReview.count({
    where: { fitnessClassId },
  })

  // Get reviews for the class with pagination
  const reviews = await prisma.fitnessClassReview.findMany({
    where: { fitnessClassId },
    skip,
    take: limit,
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      fitnessClass: {
        select: {
          id: true,
          name: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return {
    data: reviews,
    meta: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
    },
  }
}

/**
 * Get rating summary for a fitness class
 * @param fitnessClassId ID of the fitness class
 * @returns Rating summary including average rating and distribution
 */
export const getClassRatingSummary = async (
  fitnessClassId: string
): Promise<ReviewTypes.ClassRatingSummary> => {
  // Check if fitness class exists
  const fitnessClass = await prisma.fitnessClass.findUnique({
    where: { id: fitnessClassId },
  })

  if (!fitnessClass) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('Fitness class'),
      true
    )
  }

  // Get all ratings for the class
  const reviews = await prisma.fitnessClassReview.findMany({
    where: { fitnessClassId },
    select: { rating: true },
  })

  const totalReviews = reviews.length

  // Calculate average rating
  const sumRatings = reviews.reduce(
    (sum: number, review: { rating: number }) => sum + review.rating,
    0
  )
  const averageRating = totalReviews > 0 ? sumRatings / totalReviews : 0

  // Calculate rating distribution
  const ratingDistribution = {
    oneStar: reviews.filter((review: { rating: number }) => review.rating === 1)
      .length,
    twoStars: reviews.filter(
      (review: { rating: number }) => review.rating === 2
    ).length,
    threeStars: reviews.filter(
      (review: { rating: number }) => review.rating === 3
    ).length,
    fourStars: reviews.filter(
      (review: { rating: number }) => review.rating === 4
    ).length,
    fiveStars: reviews.filter(
      (review: { rating: number }) => review.rating === 5
    ).length,
  }

  return {
    fitnessClassId,
    className: fitnessClass.name,
    averageRating,
    totalReviews,
    ratingDistribution,
  }
}

/**
 * Get a user's review for a specific fitness class
 * @param userId ID of the user
 * @param fitnessClassId ID of the fitness class
 * @returns User's review for the class or null if not found
 */
export const getUserReviewForClass = async (
  userId: string,
  fitnessClassId: string
): Promise<FitnessClassReview | null> => {
  const review = await prisma.fitnessClassReview.findFirst({
    where: {
      userId,
      fitnessClassId,
    },
    include: {
      user: {
        select: {
          id: true,
          name: true,
        },
      },
      fitnessClass: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  })

  return review
}
