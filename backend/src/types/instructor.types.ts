import { UserRole } from '@prisma/client'

/**
 * Interface for instructor data with class count
 */
export interface InstructorWithClassCount {
  id: string
  name: string
  email: string
  role: UserRole
  mobile: string | null
  address: string | null
  dob: Date | null
  createdAt: Date
  updatedAt: Date
  classCount: number
}
