import { Router } from 'express'
import { validateRequest } from '../../middlewares/validation.middleware'
import { GymSchema } from '../../schemas'
import { GymController } from '../../controllers'

const gymRouter = Router()

/**
 * @route GET /api/admin/gyms
 * @desc Get all gyms with pagination and filtering
 * @access Admin only
 */
gymRouter.get(
  '/',
  validateRequest({ query: GymSchema.getGymsSchema }),
  GymController.getGyms
)

/**
 * @route POST /api/admin/gyms
 * @desc Create a new gym
 * @access Admin only
 */
gymRouter.post(
  '/',
  validateRequest({ body: GymSchema.createGymSchema }),
  GymController.createGym
)

export default gymRouter
