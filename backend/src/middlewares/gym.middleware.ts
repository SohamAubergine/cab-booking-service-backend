import { Request, Response, NextFunction } from 'express'
import prisma from '../config/db'
import { APIResponse } from '../utils/responseGenerator'
import { STATUS_CODES } from '../utils/statusCodes'
import { MESSAGES } from '../utils/messages'
import { CONSTANTS } from '../utils/constants'

/**
 * Middleware to check if the current user is the owner of the specified gym
 * Can also allow admin users to pass through
 * @param allowAdmin If true, admins are also allowed to proceed
 */
export const isGymOwner = (allowAdmin = true) => {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      // Get gymId from request parameters or body
      const gymId = req.params.gymId || req.body.gymId

      if (!gymId) {
        return res.status(STATUS_CODES.CLIENT_ERROR.BAD_REQUEST).json(
          APIResponse.sendError({
            message: MESSAGES.REQUIRED('Gym ID'),
          })
        )
      }

      // Get current user
      const userId = req.user?.id
      const userRole = req.user?.role

      // If user is an admin and we're allowing admins, let them through
      if (allowAdmin && userRole === CONSTANTS.AUTH.ROLES.ADMIN) {
        return next()
      }

      // Find the gym and check ownership
      const gym = await prisma.gym.findUnique({
        where: { id: gymId },
      })

      if (!gym) {
        return res.status(STATUS_CODES.CLIENT_ERROR.NOT_FOUND).json(
          APIResponse.sendError({
            message: MESSAGES.NOT_FOUND('Gym'),
          })
        )
      }

      // Check if the current user is the owner
      if (gym.ownerId !== userId) {
        return res.status(STATUS_CODES.CLIENT_ERROR.FORBIDDEN).json(
          APIResponse.sendError({
            message: MESSAGES.FORBIDDEN,
          })
        )
      }

      // User is the owner, proceed
      next()
      return
    } catch (error) {
      next(error)
      return
    }
  }
}
