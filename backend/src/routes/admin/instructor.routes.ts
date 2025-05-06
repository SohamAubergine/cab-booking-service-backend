import { Router } from 'express'
import { InstructorController } from '../../controllers'

const instructorRouter = Router()

/**
 * @route GET /api/admin/instructors
 * @desc Get all instructors
 * @access Admin only
 */
instructorRouter.get('/', InstructorController.getAllInstructors)

export default instructorRouter
