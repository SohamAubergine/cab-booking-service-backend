import { Router } from 'express'
import { FitnessClassController } from '../../controllers'
import { validate } from '../../middlewares/validations.middleware'
import { FitnessClassSchema } from '../../schemas'

const fitnessClassRouter = Router()

/**
 * @route GET /api/admin/fitness-classes
 * @desc Get all fitness classes with filtering and pagination
 * @access Admin only
 */
fitnessClassRouter.get('/', FitnessClassController.getAllFitnessClasses)

/**
 * @route POST /api/admin/fitness-classes
 * @desc Create a new fitness class
 * @access Admin only
 */
fitnessClassRouter.post(
  '/',
  validate(FitnessClassSchema.createFitnessClassSchema),
  FitnessClassController.createFitnessClass
)

/**
 * @route PUT /api/admin/fitness-classes/:fitnessClassId
 * @desc Update an existing fitness class
 * @access Admin only
 */
fitnessClassRouter.put(
  '/:fitnessClassId',
  validate(FitnessClassSchema.updateFitnessClassSchema),
  FitnessClassController.updateFitnessClass
)

/**
 * @route DELETE /api/admin/fitness-classes/:fitnessClassId
 * @desc Delete a fitness class
 * @access Admin only
 */
fitnessClassRouter.delete(
  '/:fitnessClassId',
  FitnessClassController.deleteFitnessClass
)

export default fitnessClassRouter
