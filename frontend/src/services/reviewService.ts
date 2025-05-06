import axios from "axios";
import {
  ApiResponse,
  ClassRatingSummary,
  CreateReviewRequest,
  PaginatedResponse,
  Review,
} from "../types";
import { api, handleApiError } from "./apiClient";

export const reviewService = {
  // Submit a review
  submitReview: async (
    data: CreateReviewRequest
  ): Promise<ApiResponse<Review>> => {
    try {
      const response = await api.post<ApiResponse<Review>>("/reviews", data);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get all reviews for a class
  getClassReviews: async (
    fitnessClassId: string,
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Review>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Review>>>(
        `/reviews/classes/${fitnessClassId}`,
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get class rating summary
  getClassRatingSummary: async (
    fitnessClassId: string
  ): Promise<ApiResponse<ClassRatingSummary>> => {
    try {
      const response = await api.get<ApiResponse<ClassRatingSummary>>(
        `/reviews/classes/${fitnessClassId}/summary`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get user's review for a class
  getUserReviewForClass: async (
    fitnessClassId: string
  ): Promise<ApiResponse<Review | null>> => {
    try {
      const response = await api.get<ApiResponse<Review | null>>(
        `/reviews/classes/${fitnessClassId}/user`
      );
      return response.data;
    } catch (error) {
      // If 404, return null review
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        return {
          success: true,
          message: "No review found",
          data: null,
          extra: null,
        };
      }
      throw handleApiError(error);
    }
  },
};
