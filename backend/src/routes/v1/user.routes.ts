import { Router } from "express";
import { UserController } from "../../controllers";
import { authenticate, isSelfOrAdmin } from "../../middlewares/auth.middleware";

const userRouter = Router();

/**
 * @route GET /api/v1/users/instructors
 * @desc Get all users with instructor role
 * @access Authenticated users
 */
userRouter.get("/instructors", authenticate, UserController.getInstructors);

/**
 * @route GET /api/v1/users/activity
 * @desc Get recent activity for the authenticated user
 * @access Authenticated users
 */
userRouter.get("/activity", authenticate, UserController.getUserActivity);

/**
 * @route GET /api/v1/users/me/gyms
 * @desc Get all gyms owned by the authenticated user
 * @access Authenticated users
 */
userRouter.get("/me/gyms", authenticate, UserController.getUserGyms);

/**
 * @route GET /api/v1/users/:userId
 * @desc Get a user by ID
 * @access Authenticated users (admin or the user themselves)
 */
userRouter.get(
  "/:userId",
  authenticate,
  isSelfOrAdmin,
  UserController.getUserById
);

export default userRouter;
