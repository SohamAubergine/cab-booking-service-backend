import prisma from '../config/db'
import { FavoriteClassTypes, Pagination, PaginatedResult } from '../types'
import { APIError } from '../utils/customError'
import { MESSAGES } from '../utils/messages'
import { STATUS_CODES } from '../utils/statusCodes'

/**
 * Add a fitness class to user's favorites
 * @param userId - ID of the user
 * @param fitnessClassId - ID of the fitness class to favorite
 * @returns The created favorite class record
 */
export const addFavoriteClass = async (
  userId: string,
  fitnessClassId: string
): Promise<FavoriteClassTypes.FavoriteClass> => {
  // Validate user exists
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

  // Validate fitness class exists
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

  // Check if already favorited
  const existingFavorite = await prisma.favoriteClass.findUnique({
    where: {
      userId_fitnessClassId: {
        userId,
        fitnessClassId,
      },
    },
  })

  if (existingFavorite) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.CONFLICT,
      MESSAGES.FAVORITE.EXISTS,
      true
    )
  }

  // Add to favorites
  const favorite = await prisma.favoriteClass.create({
    data: {
      userId,
      fitnessClassId,
    },
    include: {
      fitnessClass: {
        include: {
          category: true,
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  })

  return favorite
}

/**
 * Remove a fitness class from user's favorites
 * @param userId - ID of the user
 * @param fitnessClassId - ID of the fitness class to unfavorite
 */
export const removeFavoriteClass = async (
  userId: string,
  fitnessClassId: string
): Promise<void> => {
  // Check if favorite exists
  const favorite = await prisma.favoriteClass.findUnique({
    where: {
      userId_fitnessClassId: {
        userId,
        fitnessClassId,
      },
    },
  })

  if (!favorite) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.FAVORITE.NOT_EXISTS,
      true
    )
  }

  // Remove from favorites
  await prisma.favoriteClass.delete({
    where: {
      id: favorite.id,
    },
  })
}

/**
 * Get all favorite classes for a user with pagination
 * @param userId - ID of the user
 * @param pagination - Pagination parameters
 * @returns Paginated result of favorite classes
 */
export const getUserFavoriteClasses = async (
  userId: string,
  pagination: Pagination
): Promise<PaginatedResult<FavoriteClassTypes.FavoriteClass>> => {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  // Get total count for pagination metadata
  const totalItems = await prisma.favoriteClass.count({
    where: { userId },
  })

  // Get favorite classes with pagination
  const favorites = await prisma.favoriteClass.findMany({
    where: { userId },
    skip,
    take: limit,
    orderBy: {
      createdAt: 'desc',
    },
    include: {
      fitnessClass: {
        include: {
          category: true,
          instructor: {
            select: {
              id: true,
              name: true,
              email: true,
              role: true,
            },
          },
        },
      },
    },
  })

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return {
    data: favorites,
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
 * Check if a fitness class is in user's favorites
 * @param userId - ID of the user
 * @param fitnessClassId - ID of the fitness class
 * @returns Boolean indicating if class is favorited
 */
export const isClassFavorited = async (
  userId: string,
  fitnessClassId: string
): Promise<boolean> => {
  const favorite = await prisma.favoriteClass.findUnique({
    where: {
      userId_fitnessClassId: {
        userId,
        fitnessClassId,
      },
    },
  })

  return !!favorite
}
