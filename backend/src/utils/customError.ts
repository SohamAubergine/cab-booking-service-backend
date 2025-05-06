export class APIError extends Error {
  status: number
  isOperational: boolean
  initialError: Error

  constructor(
    status: number,
    message: string,
    isOperational: boolean = true,
    error: Error | null = null
  ) {
    super(message)
    this.status = status
    this.isOperational = isOperational
    this.initialError = error ?? this

    Error.captureStackTrace(this, this.constructor)
  }
}
