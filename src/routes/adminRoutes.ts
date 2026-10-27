import { Router } from "express";

import { authMiddleware } from "../middleware/authMiddleware";
import requireAdmin from "../middleware/requireAdmin";

import {
  getDoctorsController,
  updateDoctorApprovalController,
  updateDoctorActiveStatusController,
} from "../controllers/adminController";

import { createReceptionistController } from "../controllers/receptionistController";

import {
  createSyncJob,
  getLatestSyncJob,
} from "../controllers/syncController";

const router = Router();

// Every route in this file requires an authenticated admin.
router.use(authMiddleware, requireAdmin);

// List all doctors, or filter by approval status.
router.get("/doctors", getDoctorsController);

// Approve or reject a doctor's registration.
router.patch("/doctors/:id/approval", updateDoctorApprovalController);

// Activate or deactivate a doctor.
router.patch("/doctors/:id/status", updateDoctorActiveStatusController);

router.post("/receptionists", createReceptionistController);

// Synchronization controls: admin authentication is already applied above.
router.post("/sync-jobs", createSyncJob);
router.get("/sync-jobs/latest", getLatestSyncJob);

export default router;
