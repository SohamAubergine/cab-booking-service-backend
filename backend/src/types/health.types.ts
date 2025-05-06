/**
 * Interface representing the health status of the API
 */
export interface HealthStatus {
  /**
   * Status of the API (OK, ERROR, etc.)
   */
  status: string

  /**
   * Current timestamp in ISO format
   */
  timestamp: string

  /**
   * Server uptime in seconds
   */
  uptime: number

  /**
   * Current environment (development, production, etc.)
   */
  environment: string
}
