import { Router } from 'express'
import { HealthController } from '../../controllers/'

const healthRouter = Router()

/**
 * @route GET /api/v1/health
 * @desc Health check endpoint
 * @access Public
 */
healthRouter.get('/', HealthController.healthCheck)

export default healthRouter
