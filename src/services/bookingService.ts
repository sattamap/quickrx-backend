import mongoose from "mongoose";
import Booking, { type IBooking, type BookingStatus } from "../models/Booking";
import BookingCounter from "../models/BookingCounter";
import User from "../models/User";

export class BookingServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.name = "BookingServiceError";
    this.statusCode = statusCode;
  }
}

export interface CreateBookingInput {
  patientName: string;
  doctorId: string;
  bookedBy: string;
}

/**
 * Returns today's date in Bangladesh local time as YYYY-MM-DD.
 */
export const getBangladeshDate = (): string => {
  const parts = new Intl.DateTimeFormat("en-GB", {
    timeZone: "Asia/Dhaka",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const values = Object.fromEntries(
    parts.map(({ type, value }) => [type, value]),
  );

  return `${values.year}-${values.month}-${values.day}`;
};

/**
 * Atomically allocates the next serial for one doctor on one date.
 * A duplicate-key race during initial counter creation is handled by
 * retrying as a normal atomic increment.
 */
const allocateSerial = async (
  doctorId: mongoose.Types.ObjectId,
  bookingDate: string,
): Promise<number> => {
  const filter = { doctorId, bookingDate };

  try {
    const counter = await BookingCounter.findOneAndUpdate(
      filter,
      {
        $inc: { lastSerial: 1 },
        $setOnInsert: { doctorId, bookingDate },
      },
      {
        upsert: true,
        new: true,
        runValidators: true,
        setDefaultsOnInsert: true,
      },
    );

    if (!counter) {
      throw new Error("Failed to allocate a booking serial.");
    }

    return counter.lastSerial;
  } catch (error: unknown) {
    const isDuplicateKey =
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === 11000;

    if (!isDuplicateKey) {
      throw error;
    }

    // Another request created this doctor's daily counter first.
    const counter = await BookingCounter.findOneAndUpdate(
      filter,
      { $inc: { lastSerial: 1 } },
      { new: true, runValidators: true },
    );

    if (!counter) {
      throw new Error("Failed to allocate a booking serial.");
    }

    return counter.lastSerial;
  }
};

/**
 * Creates a booking for today only.
 */
export const createBooking = async (
  input: CreateBookingInput,
): Promise<IBooking> => {
  const patientName = input.patientName.trim();

  if (!patientName || patientName.length > 150) {
    throw new BookingServiceError(
      "Patient name is required and cannot exceed 150 characters.",
      400,
    );
  }

  if (
    !mongoose.isValidObjectId(input.doctorId) ||
    !mongoose.isValidObjectId(input.bookedBy)
  ) {
    throw new BookingServiceError("Invalid doctor or booking operator.", 400);
  }

  const doctor = await User.findById(input.doctorId)
    .select("_id role approvalStatus isActive")
    .lean();

  if (
    !doctor ||
    doctor.role !== "doctor" ||
    !doctor.isActive ||
    doctor.approvalStatus !== "approved"
  ) {
    throw new BookingServiceError(
      "The selected doctor is unavailable for booking.",
      400,
    );
  }

  const doctorId = new mongoose.Types.ObjectId(input.doctorId);
  const bookedBy = new mongoose.Types.ObjectId(input.bookedBy);
  const bookingDate = getBangladeshDate();

  const serialNumber = await allocateSerial(doctorId, bookingDate);

  const booking = await Booking.create({
    patientName,
    doctorId,
    bookingDate,
    serialNumber,
    status: "waiting",
    bookedBy,
  });

  return booking;
};

/**
 * Retrieves today's bookings for one doctor, ordered by serial number.
 */
export const getTodayBookings = async (
  doctorId: string,
): Promise<IBooking[]> => {
  if (!mongoose.isValidObjectId(doctorId)) {
    throw new BookingServiceError("Invalid doctor ID.", 400);
  }

  const doctor = await User.findById(doctorId)
    .select("_id role approvalStatus isActive")
    .lean();

  if (
    !doctor ||
    doctor.role !== "doctor" ||
    !doctor.isActive ||
    doctor.approvalStatus !== "approved"
  ) {
    throw new BookingServiceError("The selected doctor is unavailable.", 403);
  }

  const bookingDate = getBangladeshDate();

  return Booking.find({
    doctorId: new mongoose.Types.ObjectId(doctorId),
    bookingDate,
  }).sort({ serialNumber: 1 });
};

/**
 * Updates the status of one of the doctor's bookings for today.
 */
export const updateBookingStatus = async (
  bookingId: string,
  doctorId: string,
  status: BookingStatus,
): Promise<IBooking> => {
  if (
    !mongoose.isValidObjectId(bookingId) ||
    !mongoose.isValidObjectId(doctorId)
  ) {
    throw new BookingServiceError("Invalid booking or doctor ID.", 400);
  }

  const allowedStatuses: BookingStatus[] = [
    "waiting",
    "called",
    "completed",
    "cancelled",
  ];

  if (!allowedStatuses.includes(status)) {
    throw new BookingServiceError("Invalid booking status.", 400);
  }

  const booking = await Booking.findOne({
    _id: bookingId,
    doctorId,
    bookingDate: getBangladeshDate(),
  });

  if (!booking) {
    throw new BookingServiceError(
      "Today's booking was not found for this doctor.",
      404,
    );
  }

  // Completed and cancelled bookings cannot be reopened.
  if (booking.status === "completed" || booking.status === "cancelled") {
    throw new BookingServiceError(
      "A completed or cancelled booking cannot be changed.",
      409,
    );
  }

  booking.status = status;
  await booking.save();

  return booking;
};

/**
 * Retrieves active, approved doctors available for serial booking.
 * Only returns the minimum information needed by the receptionist.
 */
export const getAvailableDoctors = async (): Promise<
  { id: string; name: string }[]
> => {
  const doctors = await User.find({
    role: "doctor",
    approvalStatus: "approved",
    isActive: true,
  })
    .select("_id name")
    .sort({ name: 1 })
    .lean();

  return doctors.map((doctor) => ({
    id: doctor._id.toString(),
    name: doctor.name,
  }));
};

/**
 * Retrieves today's bookings created by the authenticated receptionist.
 */
export const getReceptionistTodayBookings = async (
  receptionistId: string,
): Promise<IBooking[]> => {
  if (!mongoose.isValidObjectId(receptionistId)) {
    throw new BookingServiceError("Invalid receptionist ID.", 400);
  }

  const receptionist = await User.findById(receptionistId)
    .select("_id role isActive")
    .lean();

  if (
    !receptionist ||
    receptionist.role !== "receptionist" ||
    !receptionist.isActive
  ) {
    throw new BookingServiceError("Receptionist account is unavailable.", 403);
  }

  return Booking.find({
    bookedBy: new mongoose.Types.ObjectId(receptionistId),
    bookingDate: getBangladeshDate(),
  }).sort({ serialNumber: 1 });
};


/**
 * Retrieves bookings created by the authenticated receptionist
 * for a selected date in Bangladesh (YYYY-MM-DD).
 */
export const getReceptionistBookingsByDate = async (
  receptionistId: string,
  bookingDate: string,
): Promise<IBooking[]> => {
  if (!mongoose.isValidObjectId(receptionistId)) {
    throw new BookingServiceError("Invalid receptionist ID.", 400);
  }

  // Validate the date format and actual calendar date.
  if (
    !/^\d{4}-\d{2}-\d{2}$/.test(bookingDate) ||
    !Number.isFinite(Date.parse(`${bookingDate}T00:00:00.000Z`)) ||
    new Date(`${bookingDate}T00:00:00.000Z`)
      .toISOString()
      .slice(0, 10) !== bookingDate
  ) {
    throw new BookingServiceError(
      "Please provide a valid booking date in YYYY-MM-DD format.",
      400,
    );
  }

  const receptionist = await User.findById(receptionistId)
    .select("_id role isActive")
    .lean();

  if (
    !receptionist ||
    receptionist.role !== "receptionist" ||
    !receptionist.isActive
  ) {
    throw new BookingServiceError(
      "Receptionist account is unavailable.",
      403,
    );
  }

  return Booking.find({
    bookedBy: new mongoose.Types.ObjectId(receptionistId),
    bookingDate,
  }).sort({ serialNumber: 1 });
};

