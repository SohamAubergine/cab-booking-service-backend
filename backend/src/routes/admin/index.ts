import { Router } from 'express'
import fitnessClassRouter from './fitnessClass.routes'
import instructorRouter from './instructor.routes'
import dashboardRouter from './dashboard.routes'
import userRouter from './user.routes'
import gymRouter from './gym.routes'
import { authenticate, hasRole } from '../../middlewares/auth.middleware'
import { CONSTANTS } from '../../utils/constants'

const adminRouter = Router()

// Apply admin role check middleware to all admin routes
adminRouter.use(authenticate, hasRole([CONSTANTS.AUTH.ROLES.ADMIN]))

// Fitness class admin routes
adminRouter.use('/fitness-classes', fitnessClassRouter)

// Instructor admin routes
adminRouter.use('/instructors', instructorRouter)

// Dashboard admin routes
adminRouter.use('/dashboard', dashboardRouter)

// User management admin routes
adminRouter.use('/users', userRouter)

// Gym management admin routes
adminRouter.use('/gyms', gymRouter)

export default adminRouter
