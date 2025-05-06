import { HealthTypes } from '../types/'
import { CONSTANTS } from '../utils/constants'

/**
 * Get the health status of the API and its dependencies
 * @returns Health status data including uptime, timestamp, and environment
 */
export const getHealthStatus = async (): Promise<HealthTypes.HealthStatus> => {
  return {
    status: CONSTANTS.HEALTH.STATUS.OK,
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
  }
}
