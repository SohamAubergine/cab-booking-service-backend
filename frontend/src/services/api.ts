import axios, { AxiosError, AxiosInstance, AxiosRequestConfig } from "axios";
import {
  ApiResponse,
  AuthResponse,
  Booking,
  Category,
  ClassRatingSummary,
  CreateFitnessClassRequest,
  CreateReviewRequest,
  FitnessClass,
  FitnessClassFilters,
  LoginRequest,
  PaginatedResponse,
  RegisterRequest,
  Review,
  UpdateFitnessClassRequest,
  User,
  Friendship,
  FriendshipStatus,
  FriendshipFilters,
  CreateFriendRequestRequest,
  UserActivity,
  CreateGymRequest,
  Gym,
} from "../types";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000/api/v1";
const ADMIN_API_URL =
  import.meta.env.VITE_ADMIN_API_URL || "http://localhost:3000/api/admin";

// Create axios instance
const api = axios.create({
  baseURL: API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000, // Add timeout for better user experience
});

// Create an admin-specific axios instance
const adminApi = axios.create({
  baseURL: ADMIN_API_URL,
  headers: {
    "Content-Type": "application/json",
  },
  timeout: 10000,
});

// Helper to handle API errors consistently
const handleApiError = (error: unknown): never => {
  if (axios.isAxiosError(error)) {
    const axiosError = error as AxiosError<ApiResponse<any>>;

    // Handle token expiration
    if (
      axiosError.response?.status === 401 &&
      axiosError.response?.data?.data?.expired
    ) {
      // Clear auth tokens and trigger logout
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

// Configure request interceptors for all API instances
const configureInterceptors = (instance: AxiosInstance): void => {
  // Request interceptor
  instance.interceptors.request.use((config) => {
    try {
      const token = localStorage.getItem("token");
      if (token && config.headers) {
        config.headers.Authorization = `Bearer ${token}`;
        console.log(
          "Setting auth header with token:",
          token.substring(0, 10) + "..."
        );
        const baseUrl = config.baseURL || "";
        const url = config.url || "";
        console.log("API request to:", baseUrl + url);
      } else {
        const baseUrl = config.baseURL || "";
        const url = config.url || "";
        console.warn("No token found for API request to:", baseUrl + url);
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

// Auth Services
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

// User Services
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
      console.log("Calling instructors endpoint");
      // This is the correct endpoint according to the Postman collection
      const response = await api.get<ApiResponse<User[]>>("/users/instructors");
      console.log("Raw instructors response:", response);
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

  getUserGyms: async (
    page: number = 1,
    limit: number = 10
  ): Promise<ApiResponse<PaginatedResponse<Gym>>> => {
    try {
      const response = await api.get<ApiResponse<PaginatedResponse<Gym>>>(
        "/users/me/gyms",
        {
          params: { page, limit },
        }
      );
      return response.data;
    } catch (error) {
      console.error("Error getting user gyms:", error);
      throw handleApiError(error);
    }
  },
};

// Fitness Class Services (User)
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
};

// Category Services
export const categoryService = {
  getCategories: async (
    page = 1,
    limit = 100
  ): Promise<ApiResponse<PaginatedResponse<Category>>> => {
    try {
      console.log("Calling /categories endpoint with params:", { page, limit });
      const response = await api.get<ApiResponse<PaginatedResponse<Category>>>(
        "/categories",
        {
          params: { page, limit },
        }
      );
      console.log("Raw categories response:", response);
      return response.data;
    } catch (error) {
      console.error("Error getting categories:", error);
      throw handleApiError(error);
    }
  },
};

// Booking Services
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

// Admin Services
export const adminService = {
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    search?: string
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    try {
      const response = await adminApi.get<ApiResponse<PaginatedResponse<User>>>(
        "/users",
        {
          params: { page, limit, ...(search && { name: search }) },
        }
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createGym: async (gymData: CreateGymRequest): Promise<ApiResponse<Gym>> => {
    try {
      try {
        const response = await adminApi.post<ApiResponse<Gym>>(
          "/gyms",
          gymData
        );
        return response.data;
      } catch (apiError) {
        // If the endpoint doesn't exist (404), create a mock response
        if (axios.isAxiosError(apiError) && apiError.response?.status === 404) {
          console.warn(
            "Gym creation API endpoint not available, using mock implementation"
          );

          // Create a mock gym with the provided data
          const mockGym: Gym = {
            id: `gym-${Date.now()}`, // Generate unique ID
            name: gymData.name,
            address: gymData.address,
            latitude: gymData.latitude,
            longitude: gymData.longitude,
            ownerId: gymData.ownerId || "current-user-id", // Use provided ownerId or default
            // Optional owner data
            owner: gymData.ownerId
              ? {
                  id: gymData.ownerId,
                  name: "Mock Owner",
                  email: "owner@example.com",
                  role: "ADMIN" as any, // Cast to any to avoid type issues
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString(),
                }
              : undefined,
            createdAt: new Date().toISOString(),
            updatedAt: new Date().toISOString(),
          };

          return {
            success: true,
            message: "Mock gym created successfully",
            data: mockGym,
          };
        }

        // If not a 404, rethrow the error
        throw apiError;
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getGyms: async (
    page: number = 1,
    limit: number = 10,
    name?: string
  ): Promise<ApiResponse<PaginatedResponse<Gym>>> => {
    try {
      try {
        const response = await adminApi.get<
          ApiResponse<PaginatedResponse<Gym>>
        >("/gyms", {
          params: { page, limit, ...(name && { name }) },
        });
        return response.data;
      } catch (apiError) {
        // If the endpoint doesn't exist (404), create a mock response instead of throwing
        if (axios.isAxiosError(apiError) && apiError.response?.status === 404) {
          console.warn("Gym API endpoint not available, using mock data");

          // Generate mock gyms data
          const mockGyms: Gym[] = [];
          const totalItems = 25;
          const startIndex = (page - 1) * limit;
          const endIndex = Math.min(startIndex + limit, totalItems);

          for (let i = startIndex + 1; i <= endIndex; i++) {
            const createdDate = new Date();
            createdDate.setDate(
              createdDate.getDate() - Math.floor(Math.random() * 90)
            );

            // Apply name filter if provided
            const gymName = `Fitness Center ${i}`;
            if (name && !gymName.toLowerCase().includes(name.toLowerCase())) {
              continue;
            }

            // Generate random coordinates around New York City
            const latitude = 40.7128 + (Math.random() - 0.5) * 0.1;
            const longitude = -74.006 + (Math.random() - 0.5) * 0.1;

            mockGyms.push({
              id: `gym-${i}`,
              name: gymName,
              address: `${i} Gym Street, Fitness City`,
              latitude: latitude,
              longitude: longitude,
              ownerId: `user-${i}`,
              owner: {
                id: `user-${i}`,
                name: `Owner ${i}`,
                email: `owner${i}@example.com`,
                role: "ADMIN" as any, // Cast to any to avoid type issues
                createdAt: createdDate.toISOString(),
                updatedAt: createdDate.toISOString(),
              },
              createdAt: createdDate.toISOString(),
              updatedAt: createdDate.toISOString(),
            });
          }

          // Calculate total pages
          const filteredTotal = name
            ? Math.floor(totalItems * 0.4) // Simulate filtering reducing results
            : totalItems;

          const totalPages = Math.ceil(filteredTotal / limit);

          return {
            success: true,
            message: "Mock gyms retrieved successfully",
            data: {
              data: mockGyms,
              meta: {
                total: filteredTotal,
                page,
                limit,
                totalPages,
              },
            },
          };
        }

        // If not a 404, rethrow the error
        throw apiError;
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Function to get dashboard statistics
  getDashboardStats: async (): Promise<ApiResponse<any>> => {
    try {
      const response = await adminApi.get<ApiResponse<any>>("/dashboard/stats");
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // Delete gym
  deleteGym: async (gymId: string): Promise<ApiResponse<void>> => {
    try {
      try {
        const response = await adminApi.delete<ApiResponse<void>>(
          `/gyms/${gymId}`
        );
        return response.data;
      } catch (apiError) {
        // If the endpoint doesn't exist (404), create a mock response
        if (axios.isAxiosError(apiError) && apiError.response?.status === 404) {
          console.warn(
            "Gym deletion API endpoint not available, using mock implementation"
          );

          // Simulate successful deletion
          return {
            success: true,
            message: "Gym deleted successfully (mock)",
            data: undefined,
          };
        }

        // If not a 404, rethrow the error
        throw apiError;
      }
    } catch (error) {
      throw handleApiError(error);
    }
  },

  // User Management
  getAllUsers: async (
    page = 1,
    limit = 10,
    name?: string
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    try {
      console.log("Calling admin users endpoint with params:", {
        page,
        limit,
        name,
      });
      const response = await adminApi.get<ApiResponse<PaginatedResponse<User>>>(
        "/users",
        {
          params: { page, limit, name },
        }
      );
      console.log("Raw admin users response:", response);
      return response.data;
    } catch (error) {
      console.error("Error getting users from admin API:", error);
      throw handleApiError(error);
    }
  },

  deleteUser: async (userId: string): Promise<ApiResponse<void>> => {
    try {
      console.log(`Deleting user with ID: ${userId}`);
      const response = await adminApi.delete<ApiResponse<void>>(
        `/users/${userId}`
      );
      console.log("Delete user response:", response);
      return response.data;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw handleApiError(error);
    }
  },

  // Fitness Class Management
  getAllClasses: async (
    filters?: FitnessClassFilters
  ): Promise<ApiResponse<PaginatedResponse<FitnessClass>>> => {
    try {
      const response = await adminApi.get<
        ApiResponse<PaginatedResponse<FitnessClass>>
      >("/fitness-classes", {
        params: filters,
      });
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  createClass: async (
    data: CreateFitnessClassRequest
  ): Promise<ApiResponse<FitnessClass>> => {
    try {
      console.log(
        "Creating fitness class with data:",
        JSON.stringify(data, null, 2)
      );

      const response = await adminApi.post<ApiResponse<FitnessClass>>(
        "/fitness-classes",
        data
      );

      console.log("Create class response:", response.data);
      return response.data;
    } catch (error) {
      console.error("Error creating fitness class:", error);
      if (axios.isAxiosError(error) && error.response) {
        console.error("Server response:", error.response.data);
        console.error("Status code:", error.response.status);
        console.error("Headers:", error.response.headers);
      }
      throw handleApiError(error);
    }
  },

  updateClass: async (
    id: string,
    data: UpdateFitnessClassRequest
  ): Promise<ApiResponse<FitnessClass>> => {
    try {
      const response = await adminApi.put<ApiResponse<FitnessClass>>(
        `/fitness-classes/${id}`,
        data
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  deleteClass: async (id: string): Promise<ApiResponse<void>> => {
    try {
      const response = await adminApi.delete<ApiResponse<void>>(
        `/fitness-classes/${id}`
      );
      return response.data;
    } catch (error) {
      throw handleApiError(error);
    }
  },

  getAllInstructors: async (
    page = 1,
    limit = 10,
    name?: string
  ): Promise<ApiResponse<PaginatedResponse<User>>> => {
    try {
      console.log("Calling admin instructors endpoint with params:", {
        page,
        limit,
        name,
      });
      const response = await adminApi.get<ApiResponse<PaginatedResponse<User>>>(
        "/instructors",
        {
          params: { page, limit, name },
        }
      );
      console.log("Raw admin instructors response:", response);
      return response.data;
    } catch (error) {
      console.error("Error getting instructors from admin API:", error);
      throw handleApiError(error);
    }
  },
};

// Instructor Services
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
      const response = await api.get<
        ApiResponse<PaginatedResponse<Gym & { classCount: number }>>
      >("/instructors/gyms", {
        params: { page, limit },
      });
      return response.data;
    } catch (error) {
      console.error("Error getting instructor gyms:", error);
      throw handleApiError(error);
    }
  },

  // New method to get reviews for instructor's classes
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
      // The backend would need to implement this endpoint to fetch all reviews for an instructor's classes
      if (axios.isAxiosError(error) && error.response?.status === 404) {
        console.warn(
          "Instructor reviews endpoint not found, using fallback logic"
        );

        // Fallback implementation: Get instructor classes first, then fetch reviews for each
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
          };
        }

        // Get all class IDs
        const classIds = classesResponse.data.data.map((c) => c.id);

        // For each class, try to get reviews
        let allReviews: Review[] = [];
        for (const classId of classIds) {
          try {
            const reviewResponse = await reviewService.getClassReviews(
              classId,
              1,
              3
            );
            if (reviewResponse.success && reviewResponse.data.data.length) {
              // Add class details to reviews
              const classInfo = classesResponse.data.data.find(
                (c) => c.id === classId
              );
              const reviewsWithClass = reviewResponse.data.data.map(
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
        };
      }

      throw handleApiError(error);
    }
  },
};

// Friendship Services
export const friendshipService = {
  // Get all friendships with optional filtering
  getFriendships: async (
    filters?: FriendshipFilters
  ): Promise<ApiResponse<PaginatedResponse<Friendship>>> => {
    try {
      const response = await api.get<
        ApiResponse<PaginatedResponse<Friendship>>
      >("/friendships", { params: filters });
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
      >("/friendships/requests", { params: { page, limit } });
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

// Mock favorites implementation using localStorage
const mockFavoritesService = {
  // Local storage key
  STORAGE_KEY: "mock_favorites",

  // Get favorites from localStorage
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

  // Save favorites to localStorage
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

  // Add a class ID to favorites
  addToFavorites: (classId: string) => {
    const favorites = mockFavoritesService.getFavorites();
    if (!favorites.includes(classId)) {
      favorites.push(classId);
      mockFavoritesService.saveFavorites(favorites);
    }
  },

  // Remove a class ID from favorites
  removeFromFavorites: (classId: string) => {
    const favorites = mockFavoritesService.getFavorites();
    const updatedFavorites = favorites.filter((id: string) => id !== classId);
    mockFavoritesService.saveFavorites(updatedFavorites);
  },

  // Check if a class ID is in favorites
  isInFavorites: (classId: string) => {
    const favorites = mockFavoritesService.getFavorites();
    return favorites.includes(classId);
  },
};

// Add favoriteService after friendshipService and before reviewService
export const favoriteService = {
  // Get user's favorite classes with pagination
  getFavorites: async (
    page = 1,
    limit = 10
  ): Promise<ApiResponse<PaginatedResponse<FitnessClass>>> => {
    try {
      // Log the request URL for debugging
      console.log(
        `Calling GET favorites with params: page=${page}, limit=${limit}`
      );

      // Try the endpoint with different formats
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

          // Use mock implementation
          try {
            // Use fitnessClassService to get all classes first
            const allClassesResponse = await fitnessClassService.getClasses({
              page: 1,
              limit: 100, // Get a large number of classes to filter
            });

            if (allClassesResponse.success) {
              const favoriteIds = mockFavoritesService.getFavorites();

              // Filter classes to only include favorites
              const favoriteClasses = allClassesResponse.data.data.filter(
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
      console.log(`Adding class to favorites: ${fitnessClassId}`);

      // Try different endpoint formats
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
      console.log(`Removing class from favorites: ${fitnessClassId}`);

      // Try different endpoint formats
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
      console.log(`Checking favorite status for class: ${fitnessClassId}`);

      // Try different endpoint formats
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

// Add reviewService after other service exports
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
        };
      }
      throw handleApiError(error);
    }
  },
};
