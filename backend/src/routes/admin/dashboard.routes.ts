import { Router } from 'express'
import { getDashboardStats } from '../../controllers/dashboard.controller'
import { catchAsync } from '../../utils/wrapper'

const router = Router()

/**
 * @route GET /api/admin/dashboard/stats
 * @description Get dashboard statistics for admin
 * @access Private (Admin)
 */
router.get('/stats', catchAsync(getDashboardStats))

export default router
