import { z } from 'zod'
import { MESSAGES } from '../utils/messages'

/**
 * Validation schema for creating a fitness class review
 */
export const createReviewSchema = z.object({
  rating: z
    .number()
    .int({ message: MESSAGES.DATA_TYPE('Rating', 'an integer') })
    .min(1, { message: 'Rating must be at least 1 star' })
    .max(5, { message: 'Rating cannot exceed 5 stars' }),

  feedback: z
    .string()
    .max(500, { message: MESSAGES.MAX('Feedback', 500) })
    .optional(),

  fitnessClassId: z
    .string()
    .uuid({ message: MESSAGES.INVALID('Fitness Class ID') })
    .nonempty({ message: MESSAGES.REQUIRED('Fitness Class ID') }),
})
