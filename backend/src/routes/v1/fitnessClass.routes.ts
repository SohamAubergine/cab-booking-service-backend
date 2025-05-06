import { Router } from 'express'
import { FitnessClassController, BookingController } from '../../controllers'
import { authenticate } from '../../middlewares/auth.middleware'

const fitnessClassRouter = Router()

/**
 * @route GET /api/v1/fitness-classes
 * @desc Get available fitness classes with filtering and pagination
 * @access Authenticated users
 */
fitnessClassRouter.get(
  '/',
  authenticate,
  FitnessClassController.getAvailableFitnessClasses
)

/**
 * @route GET /api/v1/fitness-classes/:fitnessClassId
 * @desc Get a single fitness class by ID
 * @access Authenticated users
 */
fitnessClassRouter.get(
  '/:fitnessClassId',
  authenticate,
  FitnessClassController.getFitnessClassById
)

/**
 * @route POST /api/v1/fitness-classes/:fitnessClassId
 * @desc Book a fitness class for the current logged-in user
 * @access Authenticated users
 */
fitnessClassRouter.post(
  '/:fitnessClassId',
  authenticate,
  BookingController.bookFitnessClass
)

export default fitnessClassRouter
