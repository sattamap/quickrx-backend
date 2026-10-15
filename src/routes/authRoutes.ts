import { Router } from "express";

import {
  registerController,
  loginController,
  refreshController,
  logoutController,
  getCurrentUserController,
  csrfTokenController,
} from "../controllers/authController";

import { authMiddleware } from "../middleware/authMiddleware";

import {
  loginRateLimiter,
  registerRateLimiter,
  refreshRateLimiter,
} from "../middleware/rateLimitMiddleware";

const router = Router();

/**
 * Public authentication routes
 *
 * Rate limiting is applied before the controller.
 */
router.post("/register", registerRateLimiter, registerController);

router.post("/login", loginRateLimiter, loginController);

router.post("/refresh", refreshRateLimiter, refreshController);

router.post("/csrf", csrfTokenController);

router.post("/logout", logoutController);

/**
 * Protected authentication route.
 */
router.get("/me", authMiddleware, getCurrentUserController);

export default router;
