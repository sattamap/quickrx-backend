import { Router } from "express";

import {
  createVisitController,
  getVisitsController,
  getPatientVisitsController,
  getVisitController,
  updateVisitController,
  deleteVisitController,
} from "../controllers/visitController";

import { validateBody } from "../middleware/validationMiddleware";

import {
  createVisitSchema,
  updateVisitSchema,
} from "../validation/visitValidation";

const router = Router();

router.post(
  "/",
  validateBody(createVisitSchema),
  createVisitController,
);

router.get(
  "/",
  getVisitsController,
);

router.get(
  "/patient/:patientId",
  getPatientVisitsController,
);

router.get(
  "/:id",
  getVisitController,
);

router.put(
  "/:id",
  validateBody(updateVisitSchema),
  updateVisitController,
);

router.delete(
  "/:id",
  deleteVisitController,
);

export default router;