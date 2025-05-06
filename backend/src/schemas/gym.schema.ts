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

/**
 * Schema for getting gyms with pagination and filtering
 */
export const getGymsSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1))
    .pipe(z.number().int().positive('Page must be a positive integer')),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10))
    .pipe(
      z
        .number()
        .int()
        .positive('Limit must be a positive integer')
        .max(100, 'Limit cannot exceed 100')
    ),
  name: z.string().optional(),
  address: z.string().optional(),
  ownerId: z.string().uuid('Owner ID must be a valid UUID').optional(),
})

/**
 * Schema for validating gym ID in URL params
 */
export const gymIdSchema = z.object({
  gymId: z.string().uuid('Gym ID must be a valid UUID'),
})
