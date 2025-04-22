import { z } from 'zod'
import { MESSAGES } from '../utils/messages'

/**
 * Validation schema for gym ID parameter
 */
export const gymIdSchema = z.object({
  gymId: z
    .string()
    .uuid({ message: MESSAGES.INVALID('Gym ID') })
    .nonempty({ message: MESSAGES.REQUIRED('Gym ID') }),
})

/**
 * Validation schema for getting fitness classes with pagination and filtering
 */
export const getFitnessClassesSchema = z.object({
  page: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 1)),
  limit: z
    .string()
    .optional()
    .transform((val) => (val ? parseInt(val, 10) : 10)),
  name: z.string().optional(),
  categoryId: z.string().uuid().optional(),
  instructorId: z.string().uuid().optional(),
  gymId: z
    .string()
    .optional()
    .transform((val) => {
      if (!val) return undefined
      // If the value contains commas, split it to get an array of gym IDs
      if (val.includes(',')) {
        return val
          .split(',')
          .map((id) => id.trim())
          .filter(Boolean)
      }
      // Otherwise, return the single ID
      return val
    })
    .pipe(
      z
        .union([
          z.string().uuid({ message: MESSAGES.INVALID('Gym ID') }),
          z.array(z.string().uuid({ message: MESSAGES.INVALID('Gym ID') })),
        ])
        .optional()
    ),
  startDateFrom: z.string().datetime().optional(),
  startDateTo: z.string().datetime().optional(),
})

/**
 * Validation schema for creating a fitness class
 */
export const createFitnessClassSchema = z
  .object({
    name: z
      .string()
      .nonempty({ message: MESSAGES.REQUIRED('Name') })
      .max(100, { message: MESSAGES.MAX('Name', 100) }),

    categoryId: z
      .string()
      .uuid({ message: MESSAGES.INVALID('Category ID') })
      .nonempty({ message: MESSAGES.REQUIRED('Category ID') }),

    instructorId: z
      .string()
      .uuid({ message: MESSAGES.INVALID('Instructor ID') })
      .nonempty({ message: MESSAGES.REQUIRED('Instructor ID') }),

    startsAt: z
      .string()
      .datetime({ message: MESSAGES.INVALID('Start time') })
      .nonempty({ message: MESSAGES.REQUIRED('Start time') }),

    endsAt: z
      .string()
      .datetime({ message: MESSAGES.INVALID('End time') })
      .nonempty({ message: MESSAGES.REQUIRED('End time') }),

    capacity: z
      .number()
      .int({ message: MESSAGES.DATA_TYPE('Capacity', 'an integer') })
      .positive({ message: MESSAGES.NOT_POSITIVE('Capacity') })
      .optional(),

    gymId: z
      .string()
      .uuid({ message: MESSAGES.INVALID('Gym ID') })
      .nonempty({ message: MESSAGES.REQUIRED('Gym ID') }),
  })
  .refine((data) => new Date(data.startsAt) < new Date(data.endsAt), {
    message: 'End time must be after start time',
    path: ['endsAt'],
  })

/**
 * Validation schema for updating a fitness class
 */
export const updateFitnessClassSchema = z
  .object({
    name: z
      .string()
      .max(100, { message: MESSAGES.MAX('Name', 100) })
      .optional(),

    categoryId: z
      .string()
      .uuid({ message: MESSAGES.INVALID('Category ID') })
      .optional(),

    instructorId: z
      .string()
      .uuid({ message: MESSAGES.INVALID('Instructor ID') })
      .optional(),

    startsAt: z
      .string()
      .datetime({ message: MESSAGES.INVALID('Start time') })
      .optional(),

    endsAt: z
      .string()
      .datetime({ message: MESSAGES.INVALID('End time') })
      .optional(),

    capacity: z
      .number()
      .int({ message: MESSAGES.DATA_TYPE('Capacity', 'an integer') })
      .positive({ message: MESSAGES.NOT_POSITIVE('Capacity') })
      .optional(),

    gymId: z
      .string()
      .uuid({ message: MESSAGES.INVALID('Gym ID') })
      .optional(),
  })
  .refine(
    (data) => {
      // Only check date comparison if both dates are provided
      if (data.startsAt && data.endsAt) {
        return new Date(data.startsAt) < new Date(data.endsAt)
      }
      return true
    },
    {
      message: 'End time must be after start time',
      path: ['endsAt'],
    }
  )
