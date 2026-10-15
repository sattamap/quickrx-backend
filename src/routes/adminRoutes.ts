
import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";

import {
  getDoctorsController,
  updateDoctorApprovalController,
  updateDoctorActiveStatusController,
} from "../controllers/adminController";

const router = Router();

// Every route in this file requires an authenticated admin.
router.use(authMiddleware, requireAdmin);

// List all doctors, or filter by approval status.
router.get("/doctors", getDoctorsController);

// Approve or reject a doctor's registration.
router.patch(
  "/doctors/:id/approval",
  updateDoctorApprovalController,
);

// Activate or deactivate a doctor.
router.patch(
  "/doctors/:id/status",
  updateDoctorActiveStatusController,
);

export default router;
