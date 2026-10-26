
import type { Request, Response } from "express";
import bcrypt from "bcryptjs";

import User from "../models/User";

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
