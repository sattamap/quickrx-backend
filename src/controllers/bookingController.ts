import type { Server } from "socket.io";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import {
  BookingServiceError,
  createBooking,
  getTodayBookings,
  updateBookingStatus,
  getAvailableDoctors,
  getReceptionistTodayBookings,
  getReceptionistBookingsByDate,
} from "../services/bookingService";

type BookingUpdateReason = "created" | "status_changed";

const emitBookingUpdated = (
  req: Request,
  doctorId: string,
  bookingDate: string,
  reason: BookingUpdateReason,
  receptionistId?: string,
): void => {
  const io = req.app.get("io") as Server | undefined;

  if (!io) {
    console.error("Socket.IO server is not available.");
    return;
  }

  const event = {
    doctorId,
    bookingDate,
    reason,
  };

  // Notify the doctor responsible for this queue.
  io.to(`doctor:${doctorId}`).emit("booking:updated", event);

  // Notify only the receptionist who created the booking.
  if (receptionistId) {
    io.to(`receptionist:${receptionistId}`).emit("booking:updated", event);
  }
};

export const createBookingController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { patientName, doctorId } = req.body as {
      patientName?: unknown;
      doctorId?: unknown;
    };

    // Validate the request body.
    if (
      typeof patientName !== "string" ||
      typeof doctorId !== "string" ||
      !patientName.trim() ||
      !doctorId.trim()
    ) {
      res.status(400).json({
        success: false,
        message: "Patient name and doctor ID are required.",
      });
      return;
    }

    if (patientName.trim().length > 150) {
      res.status(400).json({
        success: false,
        message: "Patient name cannot exceed 150 characters.",
      });
      return;
    }

    if (!mongoose.isValidObjectId(doctorId)) {
      res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
      return;
    }

    // Set by authMiddleware after verifying the logged-in user.
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const booking = await createBooking({
      patientName: patientName.trim(),
      doctorId,
      bookedBy: req.userId,
    });

    emitBookingUpdated(
      req,
      booking.doctorId.toString(),
      booking.bookingDate,
      "created",
      booking.bookedBy.toString(),
    );
    res.status(201).json({
      success: true,
      message: "Patient serial booked successfully.",
      data: {
        id: booking._id.toString(),
        patientName: booking.patientName,
        doctorId: booking.doctorId.toString(),
        bookingDate: booking.bookingDate,
        serialNumber: booking.serialNumber,
        status: booking.status,
        bookedBy: booking.bookedBy.toString(),
        createdAt: booking.createdAt,
      },
    });
  } catch (error: unknown) {
    if (error instanceof BookingServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Create booking error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to book patient serial. Please try again.",
    });
  }
};

export const getTodayBookingsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    // Only doctors may retrieve their own queue.
    if (req.userRole !== "doctor" || !req.userId) {
      res.status(403).json({
        success: false,
        message: "Only doctors can view their daily queue.",
      });
      return;
    }

    // Use the authenticated doctor's ID, never an ID from the client.
    const bookings = await getTodayBookings(req.userId);

    res.status(200).json({
      success: true,
      message: "Today's booking queue retrieved successfully.",
      data: bookings.map((booking) => ({
        id: booking._id.toString(),
        patientName: booking.patientName,
        serialNumber: booking.serialNumber,
        bookingDate: booking.bookingDate,
        status: booking.status,
        bookedAt: booking.createdAt,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof BookingServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Get today's bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve today's booking queue.",
    });
  }
};

export const updateBookingStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.userRole !== "doctor" || !req.userId) {
      res.status(403).json({
        success: false,
        message: "Only doctors can update booking status.",
      });
      return;
    }

    const id = req.params.id;

    if (typeof id !== "string" || !id.trim()) {
      res.status(400).json({
        success: false,
        message: "Invalid booking ID.",
      });
      return;
    }
    const { status } = req.body as { status?: unknown };

    if (
      typeof status !== "string" ||
      !["waiting", "called", "completed", "cancelled"].includes(status)
    ) {
      res.status(400).json({
        success: false,
        message: "Please provide a valid booking status.",
      });
      return;
    }

    const booking = await updateBookingStatus(
      id,
      req.userId,
      status as import("../models/Booking").BookingStatus,
    );

    emitBookingUpdated(
      req,
      booking.doctorId.toString(),
      booking.bookingDate,
      "status_changed",
      booking.bookedBy.toString(),
    );

    res.status(200).json({
      success: true,
      message: "Booking status updated successfully.",
      data: {
        id: booking._id.toString(),
        patientName: booking.patientName,
        serialNumber: booking.serialNumber,
        bookingDate: booking.bookingDate,
        status: booking.status,
      },
    });
  } catch (error: unknown) {
    if (error instanceof BookingServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Update booking status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update booking status.",
    });
  }
};

/**
 * GET /api/bookings/doctors
 * Lists approved, active doctors for the booking form.
 */
export const getAvailableDoctorsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const doctors = await getAvailableDoctors();

    res.status(200).json({
      success: true,
      message: "Available doctors retrieved successfully.",
      data: doctors,
    });
  } catch (error: unknown) {
    console.error("Get available doctors error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve available doctors.",
    });
  }
};

/**
 * GET /api/bookings/mine/today
 * Lists today's bookings created by this receptionist.
 */
export const getReceptionistTodayBookingsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.userRole !== "receptionist" || !req.userId) {
      res.status(403).json({
        success: false,
        message: "Only receptionists can access their booking list.",
      });
      return;
    }

    const bookings = await getReceptionistTodayBookings(req.userId);

    res.status(200).json({
      success: true,
      message: "Today's receptionist bookings retrieved successfully.",
      data: bookings.map((booking) => ({
        id: booking._id.toString(),
        patientName: booking.patientName,
        doctorId: booking.doctorId.toString(),
        serialNumber: booking.serialNumber,
        bookingDate: booking.bookingDate,
        status: booking.status,
        bookedAt: booking.createdAt,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof BookingServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Get receptionist bookings error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve today's bookings.",
    });
  }
};

export const getReceptionistBookingsByDateController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (req.userRole !== "receptionist" || !req.userId) {
      res.status(403).json({
        success: false,
        message: "Only receptionists can view their booking history.",
      });
      return;
    }

    const date = req.query.date;

    if (typeof date !== "string") {
      res.status(400).json({
        success: false,
        message: "Please provide a booking date.",
      });
      return;
    }

    const bookings = await getReceptionistBookingsByDate(req.userId, date);

    res.status(200).json({
      success: true,
      message: "Booking history retrieved successfully.",
      data: bookings.map((booking) => ({
        id: booking._id.toString(),
        patientName: booking.patientName,
        doctorId: booking.doctorId.toString(),
        serialNumber: booking.serialNumber,
        bookingDate: booking.bookingDate,
        status: booking.status,
        bookedAt: booking.createdAt,
      })),
    });
  } catch (error: unknown) {
    if (error instanceof BookingServiceError) {
      res.status(error.statusCode).json({
        success: false,
        message: error.message,
      });
      return;
    }

    console.error("Get receptionist booking history error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve booking history.",
    });
  }
};
