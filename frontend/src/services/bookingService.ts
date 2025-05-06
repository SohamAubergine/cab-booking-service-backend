import { ApiResponse, Booking, PaginatedResponse } from "../types";
import { api, handleApiError } from "./apiClient";

export const bookingService = {
  getBookings: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<Booking>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Booking>>>(
        "/bookings",
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  cancelBooking: async (bookingId: string): Promise<ApiResponse<void>> => {
    try {
      const response = await api.delete<ApiResponse<void>>(
        `/bookings/${bookingId}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },
};
