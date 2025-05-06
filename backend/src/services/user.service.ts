import prisma from "../config/db";
import { Prisma, User, UserRole } from "@prisma/client";
import { Pagination, AuthTypes } from "../types";
import { APIError } from "../utils/customError";
import { STATUS_CODES } from "../utils/statusCodes";
import { MESSAGES } from "../utils/messages";
import { GymResponse } from "../types/gym.types";

/**
 * Fetch a single user by query
 * @param userQuery Query to find the user
 * @returns User without password or null if not found
 */
export const fetchSingleUser = async (
  userQuery: Prisma.UserWhereUniqueInput
): Promise<AuthTypes.UserResponse | null> => {
  const user = await prisma.user.findUnique({
    where: userQuery,
  });

  if (!user) {
    return null;
  }

  // Exclude password from the response
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as AuthTypes.UserResponse;
};

/**
 * Get user by ID
 * @param userId ID of the user to fetch
 * @returns User without password
 * @throws APIError if user is not found
 */
export const getUserById = async (
  userId: string
): Promise<AuthTypes.UserResponse> => {
  const user = await prisma.user.findUnique({
    where: { id: userId },
  });

  if (!user) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND("User"),
      true
    );
  }

  // Exclude password from the response
  const { password, ...userWithoutPassword } = user;
  return userWithoutPassword as AuthTypes.UserResponse;
};

export const fetchUsersWithFiltersAndPagination = async (
  userQuery: Prisma.UserWhereInput,
  pagination: Pagination
): Promise<User[]> => {
  const { page, limit } = pagination;
  const skip = (page - 1) * limit;

  const users = await prisma.user.findMany({
    where: userQuery,
    skip,
    take: limit,
  });

  return users;
};

/**
 * Get all users with instructor role
 * @returns Array of users with INSTRUCTOR role, without passwords
 */
export const getInstructorUsers = async (): Promise<
  AuthTypes.UserResponse[]
> => {
  const instructors = await prisma.user.findMany({
    where: {
      role: UserRole.INSTRUCTOR,
    },
    orderBy: {
      name: "asc", // Order alphabetically by name
    },
  });

  // Remove passwords from all instructor records
  return instructors.map((instructor) => {
    const { password, ...instructorWithoutPassword } = instructor;
    return instructorWithoutPassword as AuthTypes.UserResponse;
  });
};

/**
 * Get all users with pagination and filters
 * @param options Pagination and filter options
 * @returns Paginated list of users
 */
export const getAllUsers = async ({
  page = 1,
  limit = 10,
  name,
}: {
  page: number;
  limit: number;
  name: string | undefined;
}): Promise<{
  data: AuthTypes.UserResponse[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}> => {
  // Ensure pagination parameters are valid
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  // Build where clause for filtering
  const where: Prisma.UserWhereInput = {};

  // Add name filter if provided
  if (name) {
    where.name = {
      contains: name,
      mode: "insensitive", // Case-insensitive search
    };
  }

  // Get total count of matching users
  const total = await prisma.user.count({ where });

  // Calculate total pages
  const totalPages = Math.ceil(total / limit) || 1;

  // Get users with pagination
  const skip = (page - 1) * limit;
  const users = await prisma.user.findMany({
    where,
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc", // Order by creation date (newest first)
    },
  });

  // Remove passwords from user records
  const usersWithoutPassword = users.map((user) => {
    const { password, ...userWithoutPassword } = user;
    return userWithoutPassword as AuthTypes.UserResponse;
  });

  return {
    data: usersWithoutPassword,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get recent activity for a user
 * @param userId ID of the user
 * @param limit Maximum number of activities to return
 * @returns Array of user activities
 */
export const getUserRecentActivity = async (
  userId: string,
  limit: number = 5
): Promise<
  {
    id: string;
    type: string;
    title: string;
    date: string;
    relatedId?: string;
    metadata?: Record<string, any>;
  }[]
> => {
  // Ensure limit is valid
  if (limit < 1) limit = 5;
  if (limit > 50) limit = 50;

  // Get user's bookings (including fitness class details)
  const bookings = await prisma.fitnessClassBooking.findMany({
    where: {
      userId,
    },
    include: {
      fitnessClass: {
        include: {
          category: true,
        },
      },
    },
    orderBy: {
      createdAt: "desc",
    },
    take: limit,
  });

  // Transform bookings into activity items
  const activities = bookings.map((booking) => {
    const now = new Date();
    const classEndTime = booking.fitnessClass.endsAt;
    const isCompleted = classEndTime < now;

    return {
      id: booking.id,
      type: isCompleted ? "COMPLETED" : "BOOKING",
      title: booking.fitnessClass.name,
      date: isCompleted
        ? booking.fitnessClass.endsAt.toISOString()
        : booking.createdAt.toISOString(),
      relatedId: booking.fitnessClassId,
      metadata: {
        categoryName: booking.fitnessClass.category?.name,
        categoryId: booking.fitnessClass.categoryId,
        startsAt: booking.fitnessClass.startsAt,
        endsAt: booking.fitnessClass.endsAt,
      },
    };
  });

  // Sort by date (newest first)
  activities.sort(
    (a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()
  );

  // Return limited number of activities
  return activities.slice(0, limit);
};

/**
 * Get all gyms owned by a specific user with pagination
 * @param userId ID of the user
 * @param page Page number for pagination (1-based)
 * @param limit Number of items per page
 * @returns Paginated list of gyms owned by the user
 */
export const getUserGyms = async (
  userId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: GymResponse[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}> => {
  // Ensure pagination parameters are valid
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  // Get total count of user's gyms
  const total = await prisma.gym.count({
    where: { ownerId: userId },
  });

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Calculate total pages
  const totalPages = Math.ceil(total / limit) || 1;

  // Get gyms with pagination
  const gyms = await prisma.gym.findMany({
    where: { ownerId: userId },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc", // Newest first
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return {
    data: gyms,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};

/**
 * Get all gyms where the user is an instructor with pagination
 * @param instructorId ID of the instructor
 * @param page Page number for pagination (1-based)
 * @param limit Number of items per page
 * @returns Paginated list of gyms where the user is an instructor
 */
export const getInstructorGyms = async (
  instructorId: string,
  page: number = 1,
  limit: number = 10
): Promise<{
  data: GymResponse[];
  meta: { total: number; page: number; limit: number; totalPages: number };
}> => {
  // Ensure pagination parameters are valid
  if (page < 1) page = 1;
  if (limit < 1) limit = 10;
  if (limit > 100) limit = 100;

  // Get total count of instructor's gyms
  const total = await prisma.gym.count({
    where: { ownerId: instructorId },
  });

  // Calculate skip value for pagination
  const skip = (page - 1) * limit;

  // Calculate total pages
  const totalPages = Math.ceil(total / limit) || 1;

  // Get gyms with pagination
  const gyms = await prisma.gym.findMany({
    where: { ownerId: instructorId },
    skip,
    take: limit,
    orderBy: {
      createdAt: "desc", // Newest first
    },
    include: {
      owner: {
        select: {
          id: true,
          name: true,
          email: true,
          role: true,
        },
      },
    },
  });

  return {
    data: gyms,
    meta: {
      total,
      page,
      limit,
      totalPages,
    },
  };
};
