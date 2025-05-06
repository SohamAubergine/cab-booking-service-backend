import { Request, Response } from 'express'
import { catchAsync } from '../utils/wrapper'
import { AuthService } from '../services'
import { STATUS_CODES } from '../utils/statusCodes'
import { APIResponse } from '../utils/responseGenerator'
import { MESSAGES } from '../utils/messages'
import { AuthTypes } from '../types'

/**
 * Register a new user
 */
export const register = catchAsync(async (req: Request, res: Response) => {
  const userData = req.body as AuthTypes.RegisterRequest

  const user = await AuthService.register(userData)

  return res.status(STATUS_CODES.SUCCESS.CREATED).json(
    APIResponse.sendSuccess({
      message: MESSAGES.AUTH.REGISTER_SUCCESS,
      data: user,
    })
  )
})

/**
 * Login a user
 */
export const login = catchAsync(async (req: Request, res: Response) => {
  const loginData = req.body as AuthTypes.LoginRequest

  const result = await AuthService.login(loginData)

  return res.status(STATUS_CODES.SUCCESS.OK).json(
    APIResponse.sendSuccess({
      message: MESSAGES.AUTH.LOGIN_SUCCESS,
      data: result,
    })
  )
})
