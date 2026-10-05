import { Router } from "express";

import {
  createPrescriptionController,
  getPrescriptionsController,
  getPrescriptionController,
  getPrescriptionByVisitController,
  getPatientPrescriptionsController,
  updatePrescriptionController,
  deletePrescriptionController,
} from "../controllers/prescriptionController";

import { validateBody } from "../middleware/validationMiddleware";

import {
  createPrescriptionSchema,
  updatePrescriptionSchema,
} from "../validation/prescriptionValidation";

const router = Router();

router.post(
  "/",
  validateBody(createPrescriptionSchema),
  createPrescriptionController,
);

router.get(
  "/",
  getPrescriptionsController,
);

/**
 * Get all prescriptions belonging to a specific patient.
 *
 * This route must be declared before "/:id".
 */
router.get(
  "/patient/:patientId",
  getPatientPrescriptionsController,
);

router.get(
  "/visit/:visitId",
  getPrescriptionByVisitController,
);

router.get(
  "/:id",
  getPrescriptionController,
);

router.put(
  "/:id",
  validateBody(updatePrescriptionSchema),
  updatePrescriptionController,
);

router.delete(
  "/:id",
  deletePrescriptionController,
);

export default router;