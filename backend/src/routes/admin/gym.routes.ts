import { Router } from 'express'
import { validate } from '../../middlewares/'
import { GymSchema } from '../../schemas'
import { GymController } from '../../controllers'

const gymRouter = Router()

/**
 * @route POST /api/admin/gyms
 * @desc Create a new gym
 * @access Admin only
 */
gymRouter.post(
  '/',
  validate(GymSchema.createGymSchema),
  GymController.createGym
)

export default gymRouter
