/**
 * Interface for fitness class booking request
 */
export interface CreateBookingRequest {
  /**
   * ID of the fitness class to book
   */
  fitnessClassId: string
}

/**
 * Interface for fitness class booking response
 */
export interface BookingResponse {
  id: string
  userId: string
  fitnessClassId: string
  createdAt: Date
  updatedAt: Date

  // Relations
  user?: {
    id: string
    name: string
    email: string
    role: string
  }

  fitnessClass?: {
    id: string
    name: string
    startsAt: Date
    endsAt: Date
    category?: {
      id: string
      name: string
    }
    instructor?: {
      id: string
      name: string
    }
    gym?: {
      id: string
      name: string
      address: string
    }
  }
}
