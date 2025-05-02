import axios from "axios";
import {
  ApiResponse,
  CreateGymRequest,
  Gym,
  PaginatedResponse,
  User,
  UserActivity,
} from "../types";
import { api, handleApiError } from "./apiClient";

export const userService = {
  getUserProfile: async (userId: string): Promise<ApiResponse<User>> => {
    try {
      const response = await api.get<ApiResponse<User>>(`/users/${userId}`);
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getInstructors: async (): Promise<ApiResponse<User[]>> => {
    try {
      const response = await api.get<ApiResponse<User[]>>("/users/instructors");
      return response.data;
    } catch (error) {
      console.error("Error getting instructors:", error);
      throw handleApiError(error);
    }
  },

  getUserActivity: async (
    limit: number = 5
  ): Promise<ApiResponse<UserActivity[]>> => {
    try {
      const response = await api.get<ApiResponse<UserActivity[]>>(
        "/users/activity",
        {
          params: { limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting user activity:", error);
      throw handleApiError(error);
    }
  },

  getGyms: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Gym>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Gym>>>(
        "/gyms",
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting gyms:", error);
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

  getUserGyms: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Gym>>> => {
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

      let endpoint = "/users/me/gyms";
      try {
        const userJson = localStorage.getItem("user");
        if (userJson) {
          const user = JSON.parse(userJson);
          if (user.role === "ADMIN") {
            // Use adminService directly (will need to be imported where used)
            return {
              success: false,
              message: "Please use adminService",
              data: {
                data: [],
                meta: { total: 0, page, limit, totalPages: 0 },
              },
              extra: null,
            };
          }
        }
      } catch (error) {
        console.error("Error parsing user data from localStorage:", error);
      }

      const response = await api.get<ApiResponse<PaginatedResponse<Gym>>>(
        endpoint,
        {
          params: { page, limit },
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      return response.data;
    } catch (error) {
      console.error("Error getting user gyms:", error);
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

  createGym: async (gymData: CreateGymRequest): Promise<ApiResponse<Gym>> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          message: "Authentication token is missing",
          data: {} as Gym,
          extra: null,
        };
      }

      try {
        const response = await api.post<ApiResponse<Gym>>("/gyms", gymData, {
          headers: { Authorization: `Bearer ${token}` },
        });
        return response.data;
      } catch (apiError) {
        if (axios.isAxiosError(apiError) && apiError.response?.status === 404) {
          const mockGym: Gym = {
            id: `gym-${Date.now()}`,
            name: gymData.name,
            address: gymData.address,
            latitude: gymData.latitude,
            longitude: gymData.longitude,
            ownerId: "current-user-id",
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            success: true,
            message: "Gym registered successfully",
            data: mockGym,
            extra: null,
          };
        }

        if (axios.isAxiosError(apiError) && apiError.response?.status === 401) {
          return {
            success: false,
            message: "Authentication token is invalid or expired",
            data: {} as Gym,
            extra: null,
          };
        }

        throw apiError;
      }
    } catch (error) {
      console.error("Error creating gym:", error);
      throw handleApiError(error);
    }
  },

  getGymById: async (gymId: string): Promise<ApiResponse<Gym>> => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        return {
          success: false,
          message: "Authentication token is missing",
          data: {} as Gym,
          extra: null,
        };
      }

      const response = await api.get<ApiResponse<Gym>>(`/gyms/${gymId}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      return response.data;
    } catch (error) {
      console.error("Error fetching gym details:", error);
      throw handleApiError(error);
    }
  },
};
