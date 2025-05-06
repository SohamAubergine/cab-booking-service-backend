import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import prisma from "../config/db";
import { CONSTANTS } from "../utils/constants";
import { AuthTypes } from "../types";
import { APIError } from "../utils/customError";
import { STATUS_CODES } from "../utils/statusCodes";
import { MESSAGES } from "../utils/messages";
import { UserRole } from "@prisma/client";

/**
 * Register a new user
 * @param userData User registration data
 * @returns Full user information without password
 */
export const register = async (
  userData: AuthTypes.RegisterRequest
): Promise<AuthTypes.RegisterResponse> => {
  // Check if user already exists
  const existingUser = await prisma.user.findUnique({
    where: { email: userData.email },
  });

  if (existingUser) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.CONFLICT,
      MESSAGES.AUTH.EMAIL_EXISTS,
      true
    );
  }

  // Hash password
  const hashedPassword = await bcrypt.hash(
    userData.password,
    CONSTANTS.AUTH.SALT_ROUNDS
  );

  // Process date of birth if provided
  let dobDate: Date | null = null;
  if (userData.dob) {
    dobDate = new Date(userData.dob);
  }

  // Create user with proper role mapping
  const userRole = mapRole(userData.role);

  // Create user with proper null handling for optional fields
  const user = await prisma.user.create({
    data: {
      name: userData.name,
      email: userData.email,
      password: hashedPassword,
      role: userRole,
      mobile: userData.mobile || null,
      address: userData.address || null,
      dob: dobDate,
    },
  });

  // Return the user object without the password
  const { password, ...userWithoutPassword } = user;

  return userWithoutPassword as AuthTypes.RegisterResponse;
};

/**
 * Login a user
 * @param loginData Login credentials
 * @returns Authentication response with token and complete user information
 */
export const login = async (
  loginData: AuthTypes.LoginRequest
): Promise<AuthTypes.AuthResponse> => {
  // Find user by email
  const user = await prisma.user.findUnique({
    where: { email: loginData.email },
  });

  if (!user) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED,
      MESSAGES.AUTH.INVALID_CREDENTIALS,
      true
    );
  }

  // Verify password
  const isPasswordValid = await bcrypt.compare(
    loginData.password,
    user.password
  );

  if (!isPasswordValid) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.UNAUTHORIZED,
      MESSAGES.AUTH.INVALID_CREDENTIALS,
      true
    );
  }

  // Generate JWT token
  const token = generateToken({
    userId: user.id,
    id: user.id,
    email: user.email,
    role: user.role,
  });

  // Return the user object without the password
  const { password, ...userWithoutPassword } = user;

  return {
    token,
    user: userWithoutPassword as AuthTypes.UserResponse,
  };
};

/**
 * Maps the role string to UserRole enum
 * @param role Role string from the request
 * @returns UserRole enum value
 */
const mapRole = (role: string): UserRole => {
  switch (role) {
    case CONSTANTS.AUTH.ROLES.USER:
      return UserRole.USER;
    case CONSTANTS.AUTH.ROLES.INSTRUCTOR:
      return UserRole.INSTRUCTOR;
    case CONSTANTS.AUTH.ROLES.ADMIN:
      return UserRole.ADMIN;
    default:
      return UserRole.USER;
  }
};

/**
 * Generate a JWT token
 * @param payload JWT payload containing user information
 * @returns JWT token string
 */
const generateToken = (payload: AuthTypes.JwtPayload): string => {
  return jwt.sign(payload, CONSTANTS.AUTH.JWT.SECRET, {
    expiresIn: CONSTANTS.AUTH.JWT.EXPIRES_IN,
  } as jwt.SignOptions);
};
