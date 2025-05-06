import { Router } from 'express'
import v1Routes from './v1'
import adminRoutes from './admin'

const router = Router()

// API Routes with versioning
router.use('/v1', v1Routes)

// Admin routes (without versioning)
router.use('/admin', adminRoutes)

export default router
