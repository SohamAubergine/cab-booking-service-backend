import axios from "axios";
import {
  ApiResponse,
  FitnessClass,
  Gym,
  PaginatedResponse,
  Review,
} from "../types";
import { api, handleApiError } from "./apiClient";

export const instructorService = {
  getInstructorClasses: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<FitnessClass>>> => {
    try {
      const response = await api.get<
        ApiResponse<PaginatedResponse<FitnessClass>>
      >("/instructors/classes", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting instructor classes:", error);
      throw handleApiError(error);
    }
  },

  getInstructorGyms: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Gym & { classCount: number }>>> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          message: "Authentication token is missing",
          data: {
            data: [],
            meta: {
              total: 0,
              page,
              limit,
              totalPages: 0,
            },
          },
          extra: null,
        };
      }

      const response = await api.get<
        ApiResponse<PaginatedResponse<Gym & { classCount: number }>>
      >("/instructors/gyms", {
        params: { page, limit },
        headers: { Authorization: `Bearer ${token}` },
      });

      // Add classCount property if missing
      const gymsWithClassCount = response.data.data.data.map((gym) => {
        if (gym.classCount === undefined) {
          return { ...gym, classCount: 0 };
        }
        return gym;
      });

      // Return with valid format
      return {
        success: true,
        message: response.data.message || "Gyms retrieved successfully",
        data: {
          data: gymsWithClassCount,
          meta: response.data.data.meta || {
            total: gymsWithClassCount.length,
            page: page,
            limit: limit,
            totalPages: Math.ceil(gymsWithClassCount.length / limit),
          },
        },
        extra: response.data.extra,
      };
    } catch (error) {
      console.error("Error getting instructor gyms:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Failed to load gyms",
        data: {
          data: [],
          meta: {
            total: 0,
            page: page,
            limit: limit,
            totalPages: 0,
          },
        },
        extra: null,
      };
    }
  },

  // Get reviews for instructor's classes
  getInstructorReviews: async (
    page = 1,
    limit = 5
  ): Promise<ApiResponse<PaginatedResponse<Review>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Review>>>(
        "/instructors/reviews",
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      // If the endpoint doesn't exist yet, simulate the response using existing endpoints
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          "Instructor reviews endpoint not found, using fallback logic"
        );

        // Fallback implementation
        const classesResponse = await instructorService.getInstructorClasses(
          1,
          10
        );
        if (!classesResponse.success || !classesResponse.data.data.length) {
          return {
            success: true,
            message: "No classes found for instructor",
            data: {
              data: [],
              meta: { total: 0, page: 1, limit, totalPages: 0 },
            },
            extra: null,
          };
        }

        // Get all class IDs
        const classIds = classesResponse.data.data.map((c) => c.id);

        // We can't use reviewService directly due to circular dependency
        // Instead, we'll make direct API calls
        let allReviews: Review[] = [];
        for (const classId of classIds) {
          try {
            const response = await api.get<
              ApiResponse<PaginatedResponse<Review>>
            >(`/reviews/classes/${classId}`, { params: { page: 1, limit: 3 } });

            if (response.data.success && response.data.data.data.length) {
              // Add class details to reviews
              const classInfo = classesResponse.data.data.find(
                (c) => c.id === classId
              );
              const reviewsWithClass = response.data.data.data.map(
                (review) => ({
                  ...review,
                  fitnessClass: classInfo || review.fitnessClass,
                })
              );
              allReviews = [...allReviews, ...reviewsWithClass];
            }
          } catch (innerError) {
            console.error(
              `Error fetching reviews for class ${classId}:`,
              innerError
            );
          }
        }

        // Sort by date (newest first) and limit to requested amount
        allReviews.sort(
          (a, b) =>
            new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        );
        const paginatedReviews = allReviews.slice(0, limit);

        return {
          success: true,
          message: "Reviews fetched successfully",
          data: {
            data: paginatedReviews,
            meta: {
              total: allReviews.length,
              page: 1,
              limit,
              totalPages: Math.ceil(allReviews.length / limit),
            },
          },
          extra: null,
        };
      }
      throw handleApiError(error);
    }
  },
};
