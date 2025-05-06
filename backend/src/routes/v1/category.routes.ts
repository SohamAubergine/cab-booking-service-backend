import { Router } from 'express'
import { FitnessClassController } from '../../controllers'
import { authenticate } from '../../middlewares/auth.middleware'

const categoryRouter = Router()

/**
 * @route GET /api/v1/categories
 * @desc Get all fitness class categories with pagination
 * @access Authenticated users
 */
categoryRouter.get(
  '/',
  authenticate,
  FitnessClassController.getFitnessClassCategories
)

export default categoryRouter
