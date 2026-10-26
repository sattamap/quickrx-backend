
import mongoose, { Schema, type Document, type Types } from "mongoose";

export interface IBookingCounter extends Document {
  doctorId: Types.ObjectId;
  bookingDate: string;
  lastSerial: number;
  createdAt: Date;
  updatedAt: Date;
}

const bookingCounterSchema = new Schema<IBookingCounter>(
  {
    doctorId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    bookingDate: {
      type: String,
      required: true,
      match: /^\d{4}-\d{2}-\d{2}$/,
    },
    lastSerial: {
      type: Number,
      required: true,
      default: 0,
      min: 0,
      validate: {
        validator: Number.isInteger,
        message: "Last serial must be an integer.",
      },
    },
  },
  { timestamps: true },
);

// One counter per doctor per date.
bookingCounterSchema.index(
  { doctorId: 1, bookingDate: 1 },
  { unique: true },
);

const BookingCounter = mongoose.model<IBookingCounter>(
  "BookingCounter",
  bookingCounterSchema,
);

export default BookingCounter;
