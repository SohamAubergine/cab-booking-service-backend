import {
  ApiResponse,
  CreateFriendRequestRequest,
  Friendship,
  FriendshipFilters,
  PaginatedResponse,
} from "../types";
import { api, handleApiError } from "./apiClient";

export const friendshipService = {
  // Get all friendships with optional filtering
  getFriendships: async (
    filters?: FriendshipFilters
  ): Promise<ApiResponse<PaginatedResponse<Friendship>>> => {
    try {
      const response = await api.get<
        ApiResponse<PaginatedResponse<Friendship>>
      >("/friendships", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get pending friend requests
  getPendingFriendRequests: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Friendship>>> => {
    try {
      const response = await api.get<
        ApiResponse<PaginatedResponse<Friendship>>
      >("/friendships/requests", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Send a friend request
  sendFriendRequest: async (
    data: CreateFriendRequestRequest
  ): Promise<ApiResponse<Friendship>> => {
    try {
      const response = await api.post<ApiResponse<Friendship>>(
        "/friendships/requests",
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Get a specific friendship
  getFriendshipById: async (id: string): Promise<ApiResponse<Friendship>> => {
    try {
      const response = await api.get<ApiResponse<Friendship>>(
        `/friendships/${id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Accept a friend request
  acceptFriendRequest: async (id: string): Promise<ApiResponse<Friendship>> => {
    try {
      const response = await api.put<ApiResponse<Friendship>>(
        `/friendships/${id}/accept`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Reject a friend request
  rejectFriendRequest: async (id: string): Promise<ApiResponse<Friendship>> => {
    try {
      const response = await api.put<ApiResponse<Friendship>>(
        `/friendships/${id}/reject`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete a friendship
  deleteFriendship: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/friendships/${id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
