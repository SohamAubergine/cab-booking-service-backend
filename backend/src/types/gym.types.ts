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
