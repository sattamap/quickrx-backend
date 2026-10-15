
import "dotenv/config";

import mongoose from "mongoose";
import bcrypt from "bcryptjs";

import connectDB from "../config/db";
import User from "../models/User";

const createAdmin = async (): Promise<void> => {
  const name = process.env.ADMIN_NAME?.trim();
  const email = process.env.ADMIN_EMAIL?.trim().toLowerCase();
  const password = process.env.ADMIN_PASSWORD;

  if (!name || !email || !password) {
    throw new Error(
      "ADMIN_NAME, ADMIN_EMAIL, and ADMIN_PASSWORD must be configured.",
    );
  }

  if (password.length < 12) {
    throw new Error(
      "Admin password must be at least 12 characters long.",
    );
  }

  await connectDB();

  const existingUser = await User.findOne({ email });

  if (existingUser) {
    throw new Error(
      "An account with this email already exists. No account was modified.",
    );
  }

  const passwordHash = await bcrypt.hash(password, 12);

  await User.create({
    name,
    email,
    passwordHash,
    role: "admin",
    approvalStatus: "approved",
    isActive: true,
  });

  console.log("Admin account created successfully.");
  console.log(`Admin email: ${email}`);
};

createAdmin()
  .catch((error: unknown) => {
    console.error(
      "Admin setup failed:",
      error instanceof Error ? error.message : error,
    );

    process.exitCode = 1;
  })
  .finally(async () => {
    await mongoose.disconnect();
  });
