import { Router } from 'express'
import { authenticate } from '../../middlewares/auth.middleware'
import * as FavoriteClassController from '../../controllers/favoriteClass.controller'
import { validateRequest } from '../../middlewares/validation.middleware'
import { FavoriteClassSchema } from '../../schemas'

const favoriteRouter = Router()

// Apply authentication middleware to all routes
favoriteRouter.use(authenticate)

// Get all favorites for the current user
favoriteRouter.get('/', FavoriteClassController.getUserFavoriteClasses)

// Add a fitness class to favorites
favoriteRouter.post(
  '/:fitnessClassId',
  validateRequest(FavoriteClassSchema.addFavoriteClassSchema),
  FavoriteClassController.addFavoriteClass
)

// Remove a fitness class from favorites
favoriteRouter.delete(
  '/:fitnessClassId',
  validateRequest(FavoriteClassSchema.removeFavoriteClassSchema),
  FavoriteClassController.removeFavoriteClass
)

// Check if a fitness class is in favorites
favoriteRouter.get(
  '/:fitnessClassId/status',
  validateRequest(FavoriteClassSchema.isClassFavoritedSchema),
  FavoriteClassController.isClassFavorited
)

export default favoriteRouter
