import { Router } from "express";

import {
  createPrescriptionController,
  getPrescriptionsController,
  getPrescriptionController,
  getPrescriptionByVisitController,
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