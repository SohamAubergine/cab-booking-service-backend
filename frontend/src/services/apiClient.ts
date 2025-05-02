import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import { ApiResponse } from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const ADMIN_API_URL =
  import.meta.env.VITE_ADMIN_API_URL || "http://localhost:3000/api/admin";

// Create axios instances
export const api = axios.create({
  baseURL: API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

export const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: { "Content-Type": "application/json" },
  timeout: 10000,
});

// Handle API errors consistently
export const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<any>>;

    // Handle token expiration
    if (
      axiosError.response?.status === 401 &&
      axiosError.response?.data?.data?.expired
    ) {
      localStorage.removeItem("token");
      localStorage.removeItem("user");
      window.location.href = "/login?session=expired";
    }

    // Use the error message from the API if available
    if (axiosError.response?.data?.message) {
      throw new Error(axiosError.response.data.message);
    }

    // Network errors
    if (axiosError.code === "ECONNABORTED") {
      throw new Error("Request timeout. Please try again.");
    }

    if (!axiosError.response) {
      throw new Error("Network error. Please check your connection.");
    }

    // Handle other status codes
    switch (axiosError.response.status) {
      case 404:
        throw new Error("Resource not found");
      case 403:
        throw new Error("You do not have permission to access this resource");
      case 500:
        throw new Error("Server error. Please try again later.");
      default:
        throw new Error(axiosError.message || "An unexpected error occurred");
    }
  }

  // For non-Axios errors
  throw error instanceof Error
    ? error
    : new Error("An unexpected error occurred");
};

// Configure request interceptors
const configureInterceptors = (instance: AxiosInstance): void => {
  // Request interceptor
  instance.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
      }
    } catch (error) {
      console.error("Error accessing localStorage:", error);
    }
    return config;
  });

  // Response interceptor
  instance.interceptors.response.use(
    (response) => response,
    (error) => {
      if (axios.isAxiosError(error) && error.response) {
        console.error("API error response:", {
          status: error.response.status,
          url: error.config?.url,
          data: error.response.data,
        });
      }
      return Promise.reject(error);
    }
  );
};

// Apply interceptors to both API instances
configureInterceptors(api);
configureInterceptors(adminApi);
