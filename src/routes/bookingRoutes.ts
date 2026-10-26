import {
  Router,
  type Request,
  type Response,
  type NextFunction,
} from "express";
import { authMiddleware } from "../middleware/authMiddleware";
import type { UserRole } from "../models/User";
import {
  createBookingController,
  getTodayBookingsController,
  updateBookingStatusController,
  getAvailableDoctorsController,
  getReceptionistTodayBookingsController,
  getReceptionistBookingsByDateController,
} from "../controllers/bookingController";

const router = Router();

/**
 * Allow only doctors and receptionists to access booking routes.
 * authMiddleware must run first to populate req.userRole.
 */
const allowBookingRoles = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const allowedRoles: UserRole[] = ["doctor", "receptionist"];

  if (!req.userRole || !allowedRoles.includes(req.userRole)) {
    res.status(403).json({
      success: false,
      message: "You do not have permission to access booking services.",
    });
    return;
  }

  next();
};

router.use(authMiddleware, allowBookingRoles);

// POST /api/bookings — create a patient serial booking.
router.post("/", createBookingController);
router.get("/today", getTodayBookingsController);
router.get("/doctors", getAvailableDoctorsController);

router.get("/mine/today", getReceptionistTodayBookingsController);
router.get("/mine", getReceptionistBookingsByDateController);
router.patch("/:id/status", updateBookingStatusController);

export default router;
