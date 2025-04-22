import { Router, Request, Response, NextFunction } from 'express'
import { validateRequest } from '../../middlewares/validation.middleware'
import { FitnessClassSchema, GymSchema } from '../../schemas'
import { FitnessClassController, GymController } from '../../controllers'
import { authenticate } from '../../middlewares/auth.middleware'
import { isGymOwner } from '../../middlewares/gym.middleware'

const gymRouter = Router()

// Apply authentication to all gym routes
gymRouter.use(authenticate)

/**
 * @route GET /api/v1/gyms
 * @desc Get all gyms with filtering and pagination
 * @access Private
 */
gymRouter.get(
  '/',
  validateRequest({ query: GymSchema.getGymsSchema }),
  GymController.getGyms
)

/**
 * @route POST /api/v1/gyms
 * @desc Register a new gym (user becomes the owner)
 * @access Private
 */
gymRouter.post(
  '/',
  validateRequest({ body: GymSchema.createGymSchema }),
  GymController.createGym
)

/**
 * @route POST /api/v1/gyms/:gymId/fitness-classes
 * @desc Create a fitness class at a specific gym (gym owner only)
 * @access Private - Gym Owner
 */
gymRouter.post(
  '/:gymId/fitness-classes',
  validateRequest({
    params: FitnessClassSchema.gymIdSchema,
    body: FitnessClassSchema.createFitnessClassSchema,
  }),
  (req: Request, _res: Response, next: NextFunction) => {
    // Pre-populate the gymId in the body from the URL parameter
    req.body.gymId = req.params.gymId
    next()
  },
  isGymOwner(false) as any, // Only gym owners can create classes, not admins
  FitnessClassController.createFitnessClass
)

/**
 * @route GET /api/v1/gyms/:gymId/fitness-classes
 * @desc Get all fitness classes for a specific gym
 * @access Private
 */
gymRouter.get(
  '/:gymId/fitness-classes',
  validateRequest({
    params: FitnessClassSchema.gymIdSchema,
    query: FitnessClassSchema.getFitnessClassesSchema,
  }),
  (req: Request, _res: Response, next: NextFunction) => {
    // Add the gymId from params to the query parameters for filtering
    req.query.gymId = req.params.gymId
    next()
  },
  FitnessClassController.getAllFitnessClasses
)

export default gymRouter
