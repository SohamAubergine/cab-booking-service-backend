import { ApiResponse, Category, PaginatedResponse } from "../types";
import { api, handleApiError } from "./apiClient";

export const categoryService = {
  getCategories: async (
    page = 1,
    limit = 100
  ): Promise<ApiResponse<PaginatedResponse<Category>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Category>>>(
        "/categories",
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting categories:", error);
      throw handleApiError(error);
    }
  },
};
