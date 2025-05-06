import { Router } from 'express'
import { BookingController } from '../../controllers'
import { authenticate } from '../../middlewares/auth.middleware'

const bookingRouter = Router()

/**
 * @route GET /api/v1/bookings
 * @desc Get bookings for the currently logged-in user with pagination
 * @access Authenticated users
 */
bookingRouter.get('/', authenticate, BookingController.getUserBookings)

export default bookingRouter
