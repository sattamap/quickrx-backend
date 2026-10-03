import type { NextFunction, Request, Response } from "express";
import jwt from "jsonwebtoken";
import mongoose from "mongoose";

import User, { type UserRole } from "../models/User";

const JWT_SECRET = process.env.JWT_SECRET;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET is not configured.");
}

interface JwtPayload {
  userId: string;
  role: UserRole;
}

declare global {
  namespace Express {
    interface Request {
      userId?: string;
      userRole?: UserRole;
    }
  }
}

export const authMiddleware = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const authorizationHeader = req.headers.authorization;

    if (!authorizationHeader) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    if (!authorizationHeader.startsWith("Bearer ")) {
      res.status(401).json({
        success: false,
        message: "Invalid authorization format.",
      });
      return;
    }

    const token = authorizationHeader.substring(7).trim();

    if (!token) {
      res.status(401).json({
        success: false,
        message: "Access token is missing.",
      });
      return;
    }

    const decoded = jwt.verify(token, JWT_SECRET) as JwtPayload;

    if (!decoded.userId || !decoded.role) {
      res.status(401).json({
        success: false,
        message: "Invalid access token.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(decoded.userId)) {
      res.status(401).json({
        success: false,
        message: "Invalid user identity.",
      });
      return;
    }

    const user = await User.findById(decoded.userId)
      .select("_id role isActive")
      .lean();

    if (!user) {
      res.status(401).json({
        success: false,
        message: "User account not found.",
      });
      return;
    }

    if (!user.isActive) {
      res.status(403).json({
        success: false,
        message: "User account is inactive.",
      });
      return;
    }

    // Use the role from the database rather than trusting
    // an old role value from the access token.
    req.userId = user._id.toString();
    req.userRole = user.role;

    next();
  } catch (error) {
    if (error instanceof jwt.TokenExpiredError) {
      res.status(401).json({
        success: false,
        message: "Access token expired.",
      });
      return;
    }

    if (error instanceof jwt.JsonWebTokenError) {
      res.status(401).json({
        success: false,
        message: "Invalid access token.",
      });
      return;
    }

    console.error("Authentication middleware error:", error);

    res.status(500).json({
      success: false,
      message: "Authentication service error.",
    });
  }
};