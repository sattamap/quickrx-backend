
import type { NextFunction, Request, Response } from "express";

/**
 * Allow only authenticated admin users to continue.
 *
 * Must run after authMiddleware, which verifies the access
 * token and loads the user's current role from MongoDB.
 */
const requireAdmin = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  if (!req.userId || !req.userRole) {
    res.status(401).json({
      success: false,
      message: "Authentication required.",
    });
    return;
  }

  if (req.userRole !== "admin") {
    res.status(403).json({
      success: false,
      message: "Administrator access required.",
    });
    return;
  }

  next();
};

export default requireAdmin;
