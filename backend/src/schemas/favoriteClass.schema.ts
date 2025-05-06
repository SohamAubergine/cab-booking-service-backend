import { z } from 'zod'

/**
 * Schema for adding a fitness class to favorites
 */
export const addFavoriteClassSchema = {
  params: z.object({
    fitnessClassId: z
      .string()
      .uuid({ message: 'Invalid fitness class ID format' }),
  }),
}

/**
 * Schema for removing a fitness class from favorites
 */
export const removeFavoriteClassSchema = {
  params: z.object({
    fitnessClassId: z
      .string()
      .uuid({ message: 'Invalid fitness class ID format' }),
  }),
}

/**
 * Schema for checking if a fitness class is in favorites
 */
export const isClassFavoritedSchema = {
  params: z.object({
    fitnessClassId: z
      .string()
      .uuid({ message: 'Invalid fitness class ID format' }),
  }),
}
