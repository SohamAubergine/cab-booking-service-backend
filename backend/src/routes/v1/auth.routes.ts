import { Router } from 'express'
import { AuthController } from '../../controllers'
import { validate } from '../../middlewares/validations.middleware'
import { AuthSchema } from '../../schemas'

const authRouter = Router()

/**
 * @route POST /api/v1/auth/register
 * @desc Register a new user
 * @access Public
 */
authRouter.post(
  '/register',
  validate(AuthSchema.registerSchema),
  AuthController.register
)

/**
 * @route POST /api/v1/auth/login
 * @desc Login a user
 * @access Public
 */
authRouter.post(
  '/login',
  validate(AuthSchema.loginSchema),
  AuthController.login
)

export default authRouter
