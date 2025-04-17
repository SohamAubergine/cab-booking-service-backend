import { Request, Response } from 'express'
import { catchAsync } from '../utils/wrapper'
import { STATUS_CODES } from '../utils/statusCodes'
import { APIResponse } from '../utils/responseGenerator'
import { MESSAGES } from '../utils/messages'
import * as GymService from '../services/gym.service'

/**
 * Create a new gym
 * @route POST /api/admin/gyms
 * @access Admin
 */
export const createGym = catchAsync(async (req: Request, res: Response) => {
  const ownerId = req.body.ownerId || req.user?.id

  if (!ownerId) {
    return res.status(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST).json(
      APIResponse.sendError({
        message: MESSAGES.REQUIRED('Owner ID'),
      })
    )
  }

  const gym = await GymService.createGym(req.body, ownerId)

  return res.status(STATUS_CODES.SUCCESS.CREATED).json(
    APIResponse.sendSuccess({
      message: MESSAGES.CREATE_SUCCESS('Gym'),
      data: gym,
    })
  )
})
