/**
 * Interface for submitting a fitness class review
 */
export interface CreateReviewRequest {
  /**
   * Rating between 1-5 stars
   */
  rating: number

  /**
   * Optional feedback text
   */
  feedback?: string

  /**
   * ID of the fitness class being reviewed
   */
  fitnessClassId: string
}

/**
 * Interface for fitness class review response
 */
export interface ReviewResponse {
  id: string
  rating: number
  feedback: string | null
  userId: string
  fitnessClassId: string
  createdAt: Date
  updatedAt: Date

  // Relations
  user?: {
    id: string
    name: string
  }

  fitnessClass?: {
    id: string
    name: string
  }
}

/**
 * Interface for class rating summary
 */
export interface ClassRatingSummary {
  fitnessClassId: string
  className: string
  averageRating: number
  totalReviews: number
  ratingDistribution: {
    oneStar: number
    twoStars: number
    threeStars: number
    fourStars: number
    fiveStars: number
  }
}
