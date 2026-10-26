import dotenv from "dotenv";
dotenv.config();

import { createServer } from "node:http";
import { Server } from "socket.io";
import jwt, { type JwtPayload } from "jsonwebtoken";
import mongoose from "mongoose";

import app from "./app";
import connectDB from "./config/db";
import User from "./models/User";

const PORT = Number(process.env.PORT || 5000);
const JWT_SECRET = process.env.JWT_SECRET;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

if (!JWT_SECRET) {
  throw new Error("JWT_SECRET environment variable is not configured.");
}

if (!FRONTEND_ORIGIN) {
  throw new Error("FRONTEND_ORIGIN environment variable is not configured.");
}

if (!Number.isInteger(PORT) || PORT < 1 || PORT > 65535) {
  throw new Error("PORT must be a valid TCP port number.");
}

const frontendOrigins = FRONTEND_ORIGIN.split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

if (frontendOrigins.length === 0) {
  throw new Error("At least one frontend origin must be configured.");
}

// Create one HTTP server for Express and Socket.IO.
const httpServer = createServer(app);

const io = new Server(httpServer, {
  cors: {
    origin: frontendOrigins,
    credentials: true,
    methods: ["GET", "POST"],
  },
});

// Make Socket.IO available to controllers.
app.set("io", io);

interface AccessTokenPayload extends JwtPayload {
  userId?: unknown;
}

/**
 * Authenticate socket connections using the QuickRx access token.
 * Only approved doctors and active receptionists may connect.
 */
io.use(async (socket, next) => {
  try {
    const token: unknown = socket.handshake.auth?.token;

    if (typeof token !== "string" || !token.trim()) {
      return next(new Error("Authentication required."));
    }

    const decoded = jwt.verify(token, JWT_SECRET);

    if (
      typeof decoded === "string" ||
      typeof (decoded as AccessTokenPayload).userId !== "string"
    ) {
      return next(new Error("Invalid access token."));
    }

    const payload = decoded as AccessTokenPayload;
    const userId = payload.userId as string;

    if (!mongoose.isValidObjectId(userId)) {
      return next(new Error("Invalid user identity."));
    }

    // Always verify the current user record in the database.
    const user = await User.findById(userId)
      .select("_id role approvalStatus isActive")
      .lean();

    if (!user || !user.isActive) {
      return next(new Error("User account is unavailable."));
    }

    // Only doctors and receptionists may use booking sockets.
    if (user.role !== "doctor" && user.role !== "receptionist") {
      return next(new Error("Access denied."));
    }

    // Doctors must be approved. Receptionists must be active.
    if (user.role === "doctor" && user.approvalStatus !== "approved") {
      return next(new Error("Doctor account is not approved."));
    }

    // Never accept the user ID or role from client-provided socket data.
    socket.data.userId = user._id.toString();
    socket.data.userRole = user.role;

    next();
  } catch (error: unknown) {
    if (
      error instanceof jwt.TokenExpiredError ||
      error instanceof jwt.JsonWebTokenError
    ) {
      return next(new Error("Invalid or expired access token."));
    }

    console.error("Socket authentication error:", error);
    next(new Error("Unable to authenticate socket connection."));
  }
});

io.on("connection", (socket) => {
  const userId = socket.data.userId as string;
  const userRole = socket.data.userRole as "doctor" | "receptionist";

  if (userRole === "doctor") {
    // Doctors receive updates for their own booking queue.
    socket.join(`doctor:${userId}`);
    console.log(`Doctor connected to live queue: ${userId}`);
  } else if (userRole === "receptionist") {
    // Receptionists receive updates for bookings they created.
    socket.join(`receptionist:${userId}`);
    console.log(`Receptionist connected to live bookings: ${userId}`);
  }

  socket.on("disconnect", (reason: string) => {
    console.log(`${userRole} disconnected: ${userId}. Reason: ${reason}`);
  });
});

const startServer = async (): Promise<void> => {
  try {
    await connectDB();

    httpServer.listen(PORT, () => {
      console.log(`QuickRx backend running on port ${PORT}`);
      console.log("Socket.IO server initialized.");
    });
  } catch (error: unknown) {
    console.error("QuickRx server startup failed:", error);
    process.exitCode = 1;
  }
};

void startServer();

// import dotenv from "dotenv";
// dotenv.config();

// import app from "./app";
// import connectDB from "./config/db";

// const PORT = process.env.PORT || 5000;

// const startServer = async (): Promise<void> => {
//   await connectDB();

//   app.listen(PORT, () => {
//     console.log(`QuickRx backend running on port ${PORT}`);
//   });
// };

// startServer();

// // coderinfo26_db_user
// // YmCwggEM5ZX4fux1
