import { Request, Response } from 'express'
import { catchAsync } from '../utils/wrapper'
import { HealthService } from '../services/'
import { STATUS_CODES } from '../utils/statusCodes'
import { APIResponse } from '../utils/responseGenerator'
import { MESSAGES } from '../utils/messages'

/**
 * Health check controller to check if the API is running
 */
export const healthCheck = catchAsync(async (_req: Request, res: Response) => {
  const healthData = await HealthService.getHealthStatus()

  return res.status(STATUS_CODES.SUCCESS.OK).json(
    APIResponse.sendSuccess({
      message: MESSAGES.HEALTH.API_RUNNING,
      data: healthData,
    })
  )
})
