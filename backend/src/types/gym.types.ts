/**
 * Interface for creating a gym
 */
export interface CreateGymRequest {
  /**
   * Name of the gym
   */
  name: string

  /**
   * Address of the gym
   */
  address: string

  /**
   * ID of the owner (optional, can be derived from the authenticated user)
   */
  ownerId?: string
}

/**
 * Interface for gym response
 */
export interface GymResponse {
  id: string
  name: string
  address: string
  ownerId: string
  createdAt: Date
  updatedAt: Date
  owner?: {
    id: string
    name: string
    email: string
    role: string
  }
}

/**
 * Interface for gym query parameters
 */
export interface GetGymsQueryParams {
  /**
   * Page number for pagination (1-based)
   */
  page?: number

  /**
   * Number of items per page
   */
  limit?: number

  /**
   * Filter gyms by name
   */
  name?: string

  /**
   * Filter gyms by address
   */
  address?: string

  /**
   * Filter gyms by owner ID
   */
  ownerId?: string
}

/**
 * Interface for paginated gyms response
 */
export interface PaginatedGymsResponse {
  /**
   * Current page number
   */
  page: number

  /**
   * Number of items per page
   */
  limit: number

  /**
   * Total number of gyms matching the query
   */
  total: number

  /**
   * Array of gym data
   */
  data: GymResponse[]
}
