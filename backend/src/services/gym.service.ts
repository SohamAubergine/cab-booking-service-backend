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
