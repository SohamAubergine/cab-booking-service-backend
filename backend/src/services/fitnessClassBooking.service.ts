import prisma from '../config/db'
import { Prisma, FitnessClassBooking } from '@prisma/client'
import { Pagination, PaginatedResult } from '../types'
import { APIError } from '../utils/customError'
import { STATUS_CODES } from '../utils/statusCodes'
import { MESSAGES } from '../utils/messages'

/**
 * Fetch a single fitness class booking by query
 * @param bookingQuery Query to find the booking
 * @returns Fitness class booking or null if not found
 */
export const fetchFitnessClassBooking = async (
  bookingQuery: Prisma.FitnessClassBookingWhereInput
): Promise<FitnessClassBooking | null> => {
  const booking = await prisma.fitnessClassBooking.findFirst({
    where: bookingQuery,
    include: {
      user: true,
      fitnessClass: {
        include: {
          category: true,
          instructor: true,
        },
      },
    },
  })

  return booking
}

/**
 * Fetch multiple fitness class bookings with filters and pagination
 * @param bookingQuery Query to filter bookings
 * @param pagination Pagination parameters
 * @returns Paginated result of fitness class bookings
 */
export const fetchFitnessClassBookingsWithFiltersAndPagination = async (
  bookingQuery: Prisma.FitnessClassBookingWhereInput,
  pagination: Pagination
): Promise<PaginatedResult<FitnessClassBooking>> => {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  // Get total count for pagination metadata
  const totalItems = await prisma.fitnessClassBooking.count({
    where: bookingQuery,
  })

  const bookings = await prisma.fitnessClassBooking.findMany({
    where: bookingQuery,
    skip,
    take: limit,
    include: {
      user: true,
      fitnessClass: {
        include: {
          category: true,
          instructor: true,
        },
      },
    },
  })

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return {
    data: bookings,
    meta: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
    },
  }
}

/**
 * Create a new fitness class booking
 * @param bookingData Booking data to create
 * @returns Created fitness class booking
 */
export const createBooking = async (bookingData: {
  userId: string
  fitnessClassId: string
}): Promise<FitnessClassBooking> => {
  // Check if the user exists
  const user = await prisma.user.findUnique({
    where: { id: bookingData.userId },
  })

  if (!user) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('User'),
      true
    )
  }

  // Check if the fitness class exists
  const fitnessClass = await prisma.fitnessClass.findUnique({
    where: { id: bookingData.fitnessClassId },
    include: {
      _count: {
        select: {
          bookings: true,
        },
      },
    },
  })

  if (!fitnessClass) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('Fitness class'),
      true
    )
  }

  // Check if booking already exists
  const existingBooking = await prisma.fitnessClassBooking.findFirst({
    where: {
      userId: bookingData.userId,
      fitnessClassId: bookingData.fitnessClassId,
    },
  })

  if (existingBooking) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.CONFLICT,
      MESSAGES.BOOKING.EXISTS,
      true
    )
  }

  // Check if class is at full capacity
  if (fitnessClass._count.bookings >= fitnessClass.capacity) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.BAD_REQUEST,
      MESSAGES.BOOKING.CLASS_FULL,
      true
    )
  }

  const booking = await prisma.fitnessClassBooking.create({
    data: {
      user: {
        connect: { id: bookingData.userId },
      },
      fitnessClass: {
        connect: { id: bookingData.fitnessClassId },
      },
    },
    include: {
      user: true,
      fitnessClass: {
        include: {
          category: true,
          instructor: true,
        },
      },
    },
  })

  return booking
}

/**
 * Update a fitness class booking
 * @param bookingId ID of the booking to update
 * @param bookingData Booking data to update
 * @returns Updated fitness class booking
 */
export const updateBooking = async (
  bookingId: string,
  bookingData: Prisma.FitnessClassBookingUpdateInput
): Promise<FitnessClassBooking> => {
  // Check if booking exists
  const existingBooking = await prisma.fitnessClassBooking.findUnique({
    where: { id: bookingId },
  })

  if (!existingBooking) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('Booking'),
      true
    )
  }

  const booking = await prisma.fitnessClassBooking.update({
    where: { id: bookingId },
    data: bookingData,
    include: {
      user: true,
      fitnessClass: {
        include: {
          category: true,
          instructor: true,
        },
      },
    },
  })

  return booking
}

/**
 * Delete a fitness class booking
 * @param bookingId ID of the booking to delete
 */
export const deleteBooking = async (bookingId: string): Promise<void> => {
  // Check if booking exists
  const existingBooking = await prisma.fitnessClassBooking.findUnique({
    where: { id: bookingId },
  })

  if (!existingBooking) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('Booking'),
      true
    )
  }

  await prisma.fitnessClassBooking.delete({
    where: { id: bookingId },
  })
}

/**
 * Get bookings for a specific user
 * @param userId ID of the user
 * @param pagination Pagination parameters
 * @returns Paginated result of fitness class bookings
 */
export const getUserBookings = async (
  userId: string,
  pagination: Pagination
): Promise<PaginatedResult<FitnessClassBooking>> => {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  // Check if user exists
  const user = await prisma.user.findUnique({
    where: { id: userId },
  })

  if (!user) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('User'),
      true
    )
  }

  // Get total count for pagination metadata
  const totalItems = await prisma.fitnessClassBooking.count({
    where: { userId },
  })

  const bookings = await prisma.fitnessClassBooking.findMany({
    where: { userId },
    skip,
    take: limit,
    include: {
      user: true,
      fitnessClass: {
        include: {
          category: true,
          instructor: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return {
    data: bookings,
    meta: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
    },
  }
}

/**
 * Get bookings for a specific fitness class
 * @param fitnessClassId ID of the fitness class
 * @param pagination Pagination parameters
 * @returns Paginated result of fitness class bookings
 */
export const getClassBookings = async (
  fitnessClassId: string,
  pagination: Pagination
): Promise<PaginatedResult<FitnessClassBooking>> => {
  const { page, limit } = pagination
  const skip = (page - 1) * limit

  // Check if fitness class exists
  const fitnessClass = await prisma.fitnessClass.findUnique({
    where: { id: fitnessClassId },
  })

  if (!fitnessClass) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('Fitness class'),
      true
    )
  }

  // Get total count for pagination metadata
  const totalItems = await prisma.fitnessClassBooking.count({
    where: { fitnessClassId },
  })

  const bookings = await prisma.fitnessClassBooking.findMany({
    where: { fitnessClassId },
    skip,
    take: limit,
    include: {
      user: true,
      fitnessClass: {
        include: {
          category: true,
          instructor: true,
        },
      },
    },
    orderBy: {
      createdAt: 'desc',
    },
  })

  // Calculate pagination metadata
  const totalPages = Math.ceil(totalItems / limit)
  const hasNextPage = page < totalPages
  const hasPreviousPage = page > 1

  return {
    data: bookings,
    meta: {
      currentPage: page,
      totalPages,
      totalItems,
      itemsPerPage: limit,
      hasNextPage,
      hasPreviousPage,
    },
  }
}
