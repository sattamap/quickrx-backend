
import mongoose, { Schema, type Document, type Types } from "mongoose";

export type BookingStatus =
  | "waiting"
  | "called"
  | "completed"
  | "cancelled";

export interface IBooking extends Document {
  patientName: string;
  doctorId: Types.ObjectId;
  bookingDate: string;
  serialNumber: number;
  status: BookingStatus;
  bookedBy: Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const bookingSchema = new Schema<IBooking>(
  {
    patientName: {
      type: String,
      required: true,
      trim: true,
      maxlength: 150,
    },

    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Store as YYYY-MM-DD in the clinic's local timezone.
    // This prevents UTC date conversion from shifting the booking day.
    bookingDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },

    serialNumber: {
      type: Number,
      required: true,
      min: 1,
      validate: {
        validator: Number.isInteger,
        message: "Serial number must be an integer.",
      },
    },

    status: {
      type: String,
      enum: ["waiting", "called", "completed", "cancelled"],
      default: "waiting",
      required: true,
    },

    bookedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
);

// A doctor cannot have the same serial twice on the same day.
bookingSchema.index(
  { doctorId: 1, bookingDate: 1, serialNumber: 1 },
  { unique: true },
);

// Efficiently retrieve a doctor's daily queue.
bookingSchema.index({
  doctorId: 1,
  bookingDate: 1,
  status: 1,
  serialNumber: 1,
});

const Booking = mongoose.model<IBooking>("Booking", bookingSchema);

export default Booking;
