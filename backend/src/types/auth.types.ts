/**
 * Interface for registration request payload
 */
export interface RegisterRequest {
  name: string;
  email: string;
  password: string;
  role: "USER" | "INSTRUCTOR" | "ADMIN";
  mobile?: string;
  address?: string;
  dob?: string;
  adminCode?: string;
}

/**
 * Interface for login request payload
 */
export interface LoginRequest {
  email: string;
  password: string;
}

/**
 * Interface for JWT payload
 */
export interface JwtPayload {
  userId: string;
  id: string;
  email: string;
  role: string;
}

/**
 * Interface for authentication response
 */
export interface AuthResponse {
  token: string;
  user: UserResponse;
}

/**
 * Interface for user response (without password)
 */
export interface UserResponse {
  id: string;
  name: string;
  email: string;
  address: string | null;
  role: string;
  dob: Date | null;
  mobile: string | null;
  createdAt: Date;
  updatedAt: Date;
}

/**
 * Interface for registration response
 */
export type RegisterResponse = UserResponse;
