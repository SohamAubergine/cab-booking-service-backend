import { Request, Response, NextFunction } from 'express'

type ControllerFunction = (
  req: Request,
  res: Response,
  next: NextFunction
) => Promise<any>

export const catchAsync =
  (controller: ControllerFunction) =>
  (req: Request, res: Response, next: NextFunction) => {
    return Promise.resolve(controller(req, res, next)).catch(next)
  }
