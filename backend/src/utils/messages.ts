export const MESSAGES = {
  REQUIRED: (field: string): string =>
    `${field} is required and cannot be empty`,

  NON_EMPTY: (field: string): string => `${field} cannot be empty`,

  INVALID: (field: string): string => `${field} is invalid`,

  CREATE_SUCCESS: (object: string): string => `${object} created successfully`,
  UPDATE_SUCCESS: (object: string): string => `${object} updated successfully`,
  RETRIEVE_SUCCESS: (object: string): string =>
    `${object} retrieved successfully`,
  ARCHIVE_SUCCESS: (object: string): string =>
    `${object} archived successfully`,
  DELETE_SUCCESS: (object: string): string => `${object} deleted successfully`,

  CREATE_FAILED: (object: string): string => `Failed to create ${object}`,
  UPDATE_FAILED: (object: string): string => `Failed to update ${object}`,
  RETRIEVE_FAILED: (object: string): string => `Failed to retrieve ${object}`,
  ARCHIVE_FAILED: (object: string): string => `Failed to archive ${object}`,

  NOT_FOUND: (object: string): string => `${object} not found`,

  EXISTS: (object: string): string => `${object} already exists`,
  NOT_EXISTS: (object: string): string => `${object} does not exist`,

  DATA_TYPE: (field: string, datatype: string): string =>
    `${field} must be ${datatype}`,

  NOT_POSITIVE: (object: string): string => `${object} must be positive`,

  NOT_EMPTY: (object: string): string => `${object} should not be empty`,

  MIN: (field: string, min: number): string =>
    `Minimum length should be ${min} for ${field}`,

  MAX: (field: string, max: number): string =>
    `Maximum length should be ${max} for ${field}`,

  REQUIRED_ONE_FIELD: 'At least one field is required',
  REQUIRED_ONE_VALUE: 'At least one value is required',

  ERROR: 'Something went wrong.',
  FORBIDDEN: 'Access forbidden',
  UNAUTHORIZED: 'Unauthorized access',
  FORBIDDEN_MSG: 'Unauthorized access',
  LOG_OUT_SUCCESS: 'Logged out successfully',
  DATABASE_ERROR: 'Database Error',
  TOKEN_EXPIRED: 'Token has expired',
  USER_ARCHIVED: 'Login Failed, User is Archived',
  VALIDATION_ERR: 'Invalid Data',
  RATE_LIMIT_EXCEEDED: 'You have exceeded your request limit',

  // * Add API specific messages here
  HEALTH: {
    API_RUNNING: 'API is running',
    DATABASE_ERROR: 'Database connection error',
  },

  AUTH: {
    REGISTER_SUCCESS: 'User registered successfully',
    LOGIN_SUCCESS: 'User logged in successfully',
    INVALID_CREDENTIALS: 'Invalid email or password',
    EMAIL_EXISTS: 'Email already exists',
    UNAUTHORIZED: 'Unauthorized access',
    FORBIDDEN: 'Access forbidden',
    PASSWORD_WEAK:
      'Password is too weak. It should be at least 8 characters and include uppercase, lowercase, numbers, and special characters',
    TOKEN_INVALID: 'Invalid authentication token',
    TOKEN_MISSING: 'Authentication token is missing',
  },

  FITNESS_CLASS: {
    CREATED: 'Fitness class created successfully',
    UPDATED: 'Fitness class updated successfully',
    DELETED: 'Fitness class deleted successfully',
    INSTRUCTOR_CONFLICT: 'Instructor has a conflicting class at this time',
    INVALID_TIME_RANGE: 'End time must be after start time',
    INVALID_INSTRUCTOR_ROLE:
      'The selected user does not have an instructor role',
    CAPACITY_INVALID: 'Capacity must be a positive number',
  },

  BOOKING: {
    CREATED: 'Fitness class booked successfully',
    DELETED: 'Booking cancelled successfully',
    EXISTS: 'You have already booked this fitness class',
    CLASS_TOO_SOON: 'Cannot book a class that starts in less than 1 hour',
    CLASS_FULL: 'This fitness class is already at full capacity',
  },

  REVIEW: {
    CREATED: 'Review submitted successfully',
    UPDATED: 'Review updated successfully',
    DELETED: 'Review deleted successfully',
    EXISTS: 'You have already reviewed this fitness class',
    NOT_BOOKED: 'You cannot review a class you have not booked',
    CLASS_NOT_ENDED: 'You can only review a class after it has ended',
    INVALID_RATING: 'Rating must be between 1 and 5 stars',
  },

  FAVORITE: {
    ADDED: 'Fitness class added to favorites successfully',
    REMOVED: 'Fitness class removed from favorites successfully',
    EXISTS: 'This fitness class is already in your favorites',
    NOT_EXISTS: 'This fitness class is not in your favorites',
  },
}
