import {
  ApiResponse,
  AuthResponse,
  LoginRequest,
  RegisterRequest,
  User,
} from "../types";
import { api, handleApiError } from "./apiClient";

export const authService = {
  register: async (data: RegisterRequest): Promise<ApiResponse<User>> => {
    try {
      const response = await api.post<ApiResponse<User>>(
        "/auth/register",
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  login: async (data: LoginRequest): Promise<ApiResponse<AuthResponse>> => {
    try {
      const response = await api.post<ApiResponse<AuthResponse>>(
        "/auth/login",
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  logout: (): void => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
  },
};
