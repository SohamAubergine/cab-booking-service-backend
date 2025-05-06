import axios from "axios";
import { ApiResponse, FitnessClass, PaginatedResponse } from "../types";
import { api, handleApiError } from "./apiClient";

// Mock implementation using localStorage
const mockFavoritesService = {
  STORAGE_KEY: "mock_favorites",

  getFavorites: () => {
    try {
      const favoritesJson = localStorage.getItem(
        mockFavoritesService.STORAGE_KEY
      );
      return favoritesJson ? JSON.parse(favoritesJson) : [];
    } catch (error) {
      console.error("Error reading favorites from localStorage:", error);
      return [];
    }
  },

  saveFavorites: (favorites: string[]) => {
    try {
      localStorage.setItem(
        mockFavoritesService.STORAGE_KEY,
        JSON.stringify(favorites)
      );
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
    }
  },

  addToFavorites: (classId: string) => {
    const favorites = mockFavoritesService.getFavorites();
    if (!favorites.includes(classId)) {
      favorites.push(classId);
      mockFavoritesService.saveFavorites(favorites);
    }
  },

  removeFromFavorites: (classId: string) => {
    const favorites = mockFavoritesService.getFavorites();
    const updatedFavorites = favorites.filter((id: string) => id !== classId);
    mockFavoritesService.saveFavorites(updatedFavorites);
  },

  isInFavorites: (classId: string) => {
    const favorites = mockFavoritesService.getFavorites();
    return favorites.includes(classId);
  },
};

export const favoriteService = {
  // Get user's favorite classes with pagination
  getFavorites: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<FitnessClass>>> => {
    try {
      try {
        const response = await api.get<
          ApiResponse<PaginatedResponse<FitnessClass>>
        >("/favorites", {
          params: { page, limit },
        });
        return response.data;
      } catch (innerError) {
        if (
          axios.isAxiosError(innerError) &&
          innerError.response?.status === 404
        ) {
          console.log("Favorites API not available, using mock implementation");

          // Use mock implementation - direct API call instead of using fitnessClassService
          try {
            // Get all classes directly
            const classesResponse = await api.get<
              ApiResponse<PaginatedResponse<FitnessClass>>
            >("/fitness-classes", {
              params: { page: 1, limit: 100 }, // Get a large number of classes to filter
            });

            if (classesResponse.data.success) {
              const favoriteIds = mockFavoritesService.getFavorites();

              // Filter classes to only include favorites
              const favoriteClasses = classesResponse.data.data.data.filter(
                (fitnessClass) => favoriteIds.includes(fitnessClass.id)
              );

              // Apply pagination to filtered results
              const startIndex = (page - 1) * limit;
              const paginatedClasses = favoriteClasses.slice(
                startIndex,
                startIndex + limit
              );

              return {
                success: true,
                message: "Mock favorites retrieved successfully",
                data: {
                  data: paginatedClasses,
                  meta: {
                    total: favoriteClasses.length,
                    page,
                    limit,
                    totalPages: Math.ceil(favoriteClasses.length / limit),
                  },
                },
                extra: null,
              };
            }
            throw new Error("Failed to fetch classes for mock favorites");
          } catch (mockError) {
            console.error("Error in mock favorites implementation:", mockError);
            throw mockError;
          }
        }
        throw innerError;
      }
    } catch (error) {
      console.error("Error fetching favorites:", error);
      throw handleApiError(error);
    }
  },

  // Add a class to favorites
  addToFavorites: async (fitnessClassId: string): Promise<ApiResponse<any>> => {
    try {
      try {
        const response = await api.post<ApiResponse<any>>(
          `/favorites/${fitnessClassId}`
        );
        return response.data;
      } catch (innerError) {
        if (
          axios.isAxiosError(innerError) &&
          innerError.response?.status === 404
        ) {
          console.log("Favorites API not available, using mock implementation");

          // Use mock implementation
          mockFavoritesService.addToFavorites(fitnessClassId);

          return {
            success: true,
            message: "Added to favorites (mock)",
            data: { id: fitnessClassId },
            extra: null,
          };
        }
        throw innerError;
      }
    } catch (error) {
      console.error("Error adding to favorites:", error);
      throw handleApiError(error);
    }
  },

  // Remove a class from favorites
  removeFromFavorites: async (
    fitnessClassId: string
  ): Promise<ApiResponse<any>> => {
    try {
      try {
        const response = await api.delete<ApiResponse<any>>(
          `/favorites/${fitnessClassId}`
        );
        return response.data;
      } catch (innerError) {
        if (
          axios.isAxiosError(innerError) &&
          innerError.response?.status === 404
        ) {
          console.log("Favorites API not available, using mock implementation");

          // Use mock implementation
          mockFavoritesService.removeFromFavorites(fitnessClassId);

          return {
            success: true,
            message: "Removed from favorites (mock)",
            data: null,
            extra: null,
          };
        }
        throw innerError;
      }
    } catch (error) {
      console.error("Error removing from favorites:", error);
      throw handleApiError(error);
    }
  },

  // Check if a class is favorited
  checkFavoriteStatus: async (
    fitnessClassId: string
  ): Promise<ApiResponse<boolean>> => {
    try {
      try {
        const response = await api.get<ApiResponse<boolean>>(
          `/favorites/${fitnessClassId}/status`
        );
        return response.data;
      } catch (innerError) {
        if (
          axios.isAxiosError(innerError) &&
          innerError.response?.status === 404
        ) {
          console.log("Favorites API not available, using mock implementation");

          // Use mock implementation
          const isFavorite = mockFavoritesService.isInFavorites(fitnessClassId);

          return {
            success: true,
            message: "Favorite status checked (mock)",
            data: isFavorite,
            extra: null,
          };
        }
        throw innerError;
      }
    } catch (error) {
      console.error("Error checking favorite status:", error);
      throw handleApiError(error);
    }
  },
};
