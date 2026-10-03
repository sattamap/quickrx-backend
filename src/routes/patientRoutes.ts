import { Router } from "express";

import {
  createPatientController,
  getPatientsController,
  getPatientController,
  updatePatientController,
  deletePatientController,
} from "../controllers/patientController";

import { validateBody } from "../middleware/validationMiddleware";

import {
  createPatientSchema,
  updatePatientSchema,
} from "../validation/patientValidation";

const router = Router();

/**
 * Patient list.
 */
router.get(
  "/",
  getPatientsController,
);

/**
 * Create patient.
 */
router.post(
  "/",
  validateBody(createPatientSchema),
  createPatientController,
);

/**
 * Get patient.
 */
router.get(
  "/:id",
  getPatientController,
);

/**
 * Update patient.
 */
router.put(
  "/:id",
  validateBody(updatePatientSchema),
  updatePatientController,
);

/**
 * Delete patient.
 */
router.delete(
  "/:id",
  deletePatientController,
);

export default router;