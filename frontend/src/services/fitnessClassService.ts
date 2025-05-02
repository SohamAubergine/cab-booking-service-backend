import axios from "axios";
import {
  ApiResponse,
  Booking,
  FitnessClass,
  FitnessClassFilters,
  PaginatedResponse,
} from "../types";
import { api, handleApiError } from "./apiClient";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";

export const fitnessClassService = {
  getClasses: async (
    filters?: FitnessClassFilters
  ): Promise<ApiResponse<PaginatedResponse<FitnessClass>>> => {
    try {
      const response = await api.get<
        ApiResponse<PaginatedResponse<FitnessClass>>
      >("/fitness-classes", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getClassById: async (
    fitnessClassId: string
  ): Promise<ApiResponse<FitnessClass>> => {
    try {
      const response = await api.get<ApiResponse<FitnessClass>>(
        `/fitness-classes/${fitnessClassId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  bookClass: async (fitnessClassId: string): Promise<ApiResponse<Booking>> => {
    try {
      const response = await api.post<ApiResponse<Booking>>(
        `/fitness-classes/${fitnessClassId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getGymClasses: async (
    gymId: string,
    filters?: FitnessClassFilters
  ): Promise<ApiResponse<PaginatedResponse<FitnessClass>>> => {
    try {
      const response = await axios.get<
        ApiResponse<PaginatedResponse<FitnessClass>>
      >(`${API_URL}/gyms/${gymId}/fitness-classes`, { params: filters });
      return response.data;
    } catch (error) {
      console.error("Error fetching gym classes:", error);

      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          "Gym classes endpoint not available, using alternative implementation"
        );

        try {
          const allClassesResponse = await fitnessClassService.getClasses({
            ...filters,
            gymId,
          });
          return allClassesResponse;
        } catch (fallbackError) {
          console.error("Fallback method also failed:", fallbackError);
          throw handleApiError(fallbackError);
        }
      }
      throw handleApiError(error);
    }
  },
};
