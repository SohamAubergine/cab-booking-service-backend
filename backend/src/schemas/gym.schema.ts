import { z } from 'zod'

/**
 * Schema for creating a gym
 */
export const createGymSchema = z.object({
  name: z
    .string()
    .min(1, 'Name is required')
    .max(100, 'Name cannot exceed 100 characters'),
  address: z
    .string()
    .min(1, 'Address is required')
    .max(200, 'Address cannot exceed 200 characters'),
  ownerId: z.string().uuid('Owner ID must be a valid UUID').optional(),
})
