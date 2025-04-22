import { FitnessClassTypes } from '.'

export interface FavoriteClass {
  id: string
  userId: string
  fitnessClassId: string
  createdAt: Date
  updatedAt: Date
  fitnessClass?: FitnessClassTypes.FitnessClassResponse
}

export interface AddFavoriteClassRequest {
  fitnessClassId: string
}

export interface UserFavoriteClassesResponse {
  favorites: FavoriteClass[]
}

export interface FavoriteClassResponse {
  favorite: FavoriteClass
}
