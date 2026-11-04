
import type { Request, Response } from "express";
import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import User from "../models/User";
import { revokeAllUserSessions } from "../services/authService";

// ======================================================
// CREATE RECEPTIONIST
// ======================================================

export const createReceptionistController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { name, email, password } = req.body as {
      name?: unknown;
      email?: unknown;
      password?: unknown;
    };

    if (
      typeof name !== "string" ||
      typeof email !== "string" ||
      typeof password !== "string" ||
      !name.trim() ||
      !email.trim() ||
      !password
    ) {
      res.status(400).json({
        success: false,
        message: "Name, email and password are required.",
      });
      return;
    }

    if (name.trim().length > 100) {
      res.status(400).json({
        success: false,
        message: "Name cannot exceed 100 characters.",
      });
      return;
    }

    const normalizedEmail = email.trim().toLowerCase();

    if (
      normalizedEmail.length > 254 ||
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid email address.",
      });
      return;
    }

    if (password.length < 12 || password.length > 128) {
      res.status(400).json({
        success: false,
        message: "Password must be between 12 and 128 characters.",
      });
      return;
    }

    const existingUser = await User.findOne({
      email: normalizedEmail,
    }).lean();

    if (existingUser) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    const passwordHash = await bcrypt.hash(password, 12);

    const receptionist = await User.create({
      name: name.trim(),
      email: normalizedEmail,
      passwordHash,
      role: "receptionist",
      approvalStatus: "approved",
      isActive: true,
    });

    res.status(201).json({
      success: true,
      message: "Receptionist account created successfully.",
      data: {
        id: receptionist._id.toString(),
        name: receptionist.name,
        email: receptionist.email,
        role: receptionist.role,
        isActive: receptionist.isActive,
        createdAt: receptionist.createdAt,
      },
    });
  } catch (error: unknown) {
    // Handle duplicate-email races safely.
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000
    ) {
      res.status(409).json({
        success: false,
        message: "An account with this email already exists.",
      });
      return;
    }

    console.error("Create receptionist error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to create receptionist account.",
    });
  }
};

// ======================================================
// GET ALL RECEPTIONISTS
// ======================================================

export const getReceptionistsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const receptionists = await User.find({
      role: "receptionist",
    })
      .select("name email role isActive createdAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: receptionists.map((user) => ({
        id: user._id.toString(),
        name: user.name,
        email: user.email,
        role: user.role,
        isActive: user.isActive,
        createdAt: user.createdAt,
      })),
    });
  } catch (error: unknown) {
    console.error("Get receptionists error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to load receptionist accounts.",
    });
  }
};

// ======================================================
// ACTIVATE / DEACTIVATE RECEPTIONIST
// ======================================================

export const updateReceptionistStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const id = req.params.id;

    const { isActive } = req.body as {
      isActive?: unknown;
    };

    // Validate receptionist ID.
    if (typeof id !== "string" || !mongoose.Types.ObjectId.isValid(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid receptionist ID.",
      });
      return;
    }

    // Validate account status.
    if (typeof isActive !== "boolean") {
      res.status(400).json({
        success: false,
        message: "A valid account status is required.",
      });
      return;
    }

    // Only receptionist accounts can be updated.
    const receptionist = await User.findOneAndUpdate(
      {
        _id: id,
        role: "receptionist",
      },
      {
        $set: { isActive },
      },
      {
        new: true,
        runValidators: true,
      },
    ).select("name email role isActive createdAt");

    if (!receptionist) {
      res.status(404).json({
        success: false,
        message: "Receptionist account not found.",
      });
      return;
    }

    // Revoke all refresh sessions when deactivating.
    // Reactivated users must log in again.
    if (!isActive) {
      try {
        await revokeAllUserSessions(receptionist._id);
      } catch (sessionError: unknown) {
        // The account is already inactive.
        // Existing authentication middleware and refresh
        // checks will reject access to inactive accounts.
        console.error(
          "Failed to revoke receptionist refresh sessions:",
          sessionError,
        );
      }
    }

    res.status(200).json({
      success: true,
      message: `Receptionist account ${
        isActive ? "activated" : "deactivated"
      } successfully.`,
      data: {
        id: receptionist._id.toString(),
        name: receptionist.name,
        email: receptionist.email,
        role: receptionist.role,
        isActive: receptionist.isActive,
        createdAt: receptionist.createdAt,
      },
    });
  } catch (error: unknown) {
    console.error("Update receptionist status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update receptionist account status.",
    });
  }
};
