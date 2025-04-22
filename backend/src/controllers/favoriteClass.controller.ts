import { Request, Response } from 'express'
import { catchAsync } from '../utils/wrapper'
import { STATUS_CODES } from '../utils/statusCodes'
import { APIResponse } from '../utils/responseGenerator'
import { MESSAGES } from '../utils/messages'
import { Pagination } from '../types'
import * as FavoriteClassService from '../services/favoriteClass.service'

/**
 * Add a fitness class to user's favorites
 */
export const addFavoriteClass = catchAsync(
  async (req: Request, res: Response) => {
    const { fitnessClassId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      )
    }

    if (!fitnessClassId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST).json(
        APIResponse.sendError({
          message: MESSAGES.REQUIRED('Fitness class ID'),
        })
      )
    }

    const favorite = await FavoriteClassService.addFavoriteClass(
      userId,
      fitnessClassId
    )

    return res.status(STATUS_CODES.SUCCESS.CREATED).json(
      APIResponse.sendSuccess({
        message: MESSAGES.FAVORITE.ADDED,
        data: { favorite },
      })
    )
  }
)

/**
 * Remove a fitness class from user's favorites
 */
export const removeFavoriteClass = catchAsync(
  async (req: Request, res: Response) => {
    const { fitnessClassId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      )
    }

    if (!fitnessClassId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST).json(
        APIResponse.sendError({
          message: MESSAGES.REQUIRED('Fitness class ID'),
        })
      )
    }

    await FavoriteClassService.removeFavoriteClass(userId, fitnessClassId)

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.FAVORITE.REMOVED,
      })
    )
  }
)

/**
 * Get all favorite classes for the currently logged-in user
 */
export const getUserFavoriteClasses = catchAsync(
  async (req: Request, res: Response) => {
    const userId = req.user?.id

    if (!userId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      )
    }

    // Parse pagination parameters
    const pagination: Pagination = {
      page: req.query.page ? parseInt(req.query.page as string, 10) : 1,
      limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 10,
    }

    // Ensure pagination parameters are valid
    if (pagination.page < 1) pagination.page = 1
    if (pagination.limit < 1) pagination.limit = 10
    if (pagination.limit > 100) pagination.limit = 100

    const result = await FavoriteClassService.getUserFavoriteClasses(
      userId,
      pagination
    )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('Favorite classes'),
        data: result,
      })
    )
  }
)

/**
 * Check if a fitness class is in user's favorites
 */
export const isClassFavorited = catchAsync(
  async (req: Request, res: Response) => {
    const { fitnessClassId } = req.params
    const userId = req.user?.id

    if (!userId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED).json(
        APIResponse.sendError({
          message: MESSAGES.AUTH.UNAUTHORIZED,
        })
      )
    }

    if (!fitnessClassId) {
      return res.status(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST).json(
        APIResponse.sendError({
          message: MESSAGES.REQUIRED('Fitness class ID'),
        })
      )
    }

    const isFavorited = await FavoriteClassService.isClassFavorited(
      userId,
      fitnessClassId
    )

    return res.status(STATUS_CODES.SUCCESS.OK).json(
      APIResponse.sendSuccess({
        message: MESSAGES.RETRIEVE_SUCCESS('Favorite status'),
        data: { isFavorited },
      })
    )
  }
)
