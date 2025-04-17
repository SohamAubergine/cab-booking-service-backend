import prisma from '../config/db'
import { GymTypes } from '../types'
import { APIError } from '../utils/customError'
import { STATUS_CODES } from '../utils/statusCodes'
import { MESSAGES } from '../utils/messages'

/**
 * Create a new gym
 * @param gymData - Gym data to create
 * @param ownerId - ID of the user who will own the gym
 * @returns The created gym
 */
export const createGym = async (
  gymData: GymTypes.CreateGymRequest,
  ownerId: string
): Promise<GymTypes.GymResponse> => {
  // Check if owner exists
  const owner = await prisma.user.findUnique({
    where: { id: ownerId },
  })

  if (!owner) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('User'),
      true
    )
  }

  // Create the gym
  const gym = await prisma.gym.create({
    data: {
      name: gymData.name,
      address: gymData.address,
      ownerId,
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
  })

  return gym
}

/**
 * Get gyms with pagination and filtering
 * @param params - Query parameters for filtering and pagination
 * @returns Paginated list of gyms
 */
export const getGyms = async (
  params: GymTypes.GetGymsQueryParams
): Promise<GymTypes.PaginatedGymsResponse> => {
  const { page = 1, limit = 10, name, address, ownerId } = params

  // Calculate offset based on page and limit
  const offset = (page - 1) * limit

  // Build where clause based on filters
  const where: any = {}

  if (name) {
    where.name = {
      contains: name,
      mode: 'insensitive', // Case insensitive search
    }
  }

  if (address) {
    where.address = {
      contains: address,
      mode: 'insensitive', // Case insensitive search
    }
  }

  if (ownerId) {
    where.ownerId = ownerId
  }

  // Get total count of matching gyms
  const total = await prisma.gym.count({ where })

  // Get paginated gyms
  const gyms = await prisma.gym.findMany({
    where,
    take: limit,
    skip: offset,
    orderBy: {
      createdAt: 'desc', // Most recent first
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
  })

  return {
    page,
    limit,
    total,
    data: gyms,
  }
}

/**
 * Get a gym by ID
 * @param gymId - ID of the gym to retrieve
 * @returns The gym data or null if not found
 */
export const getGymById = async (
  gymId: string
): Promise<GymTypes.GymResponse> => {
  const gym = await prisma.gym.findUnique({
    where: {
      id: gymId,
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
  })

  if (!gym) {
    throw new APIError(
      STATUS_CODES.CLIENT_ERROR.NOT_FOUND,
      MESSAGES.NOT_FOUND('Gym'),
      true
    )
  }

  return gym
}
