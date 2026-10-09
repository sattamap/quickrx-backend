import { Router } from "express";

import {
  createInvestigationController,
  getInvestigationsByPatientController,
  getInvestigationController,
  getPendingInvestigationsController,
  updateInvestigationController,
  addInvestigationResultController,
  reviewInvestigationController,
  cancelInvestigationController,
} from "../controllers/investigationController";

import { validateBody } from "../middleware/validationMiddleware";
import {
  addInvestigationResultSchema,
} from "../validation/investigationResultValidation";

import {
  createInvestigationSchema,
  updateInvestigationSchema,
} from "../validation/investigationValidation";

const router = Router();

/**
 * Create a new investigation.
 *
 * POST /api/investigations
 *
 * Examples:
 * - OCT RNFL
 * - Visual Field
 * - OCT Macula
 */
router.post(
  "/",
  validateBody(createInvestigationSchema),
  createInvestigationController,
);

/**
 * Get all investigations for a patient.
 *
 * GET /api/investigations/patient/:patientId
 */
router.get(
  "/patient/:patientId",
  getInvestigationsByPatientController,
);

/**
 * Get pending investigations for a patient.
 *
 * IMPORTANT:
 * This route must appear before routes such as "/:id".
 *
 * GET /api/investigations/patient/:patientId/pending
 */
router.get(
  "/patient/:patientId/pending",
  getPendingInvestigationsController,
);

/**
 * Get a single investigation.
 *
 * GET /api/investigations/:id
 */
router.get(
  "/:id",
  getInvestigationController,
);

/**
 * Add a test result to an investigation.
 *
 * PATCH /api/investigations/:id/result
 */
router.patch(
  "/:id/result",
  validateBody(addInvestigationResultSchema),
  addInvestigationResultController,
);

/**
 * Mark an investigation as reviewed.
 *
 * PATCH /api/investigations/:id/review
 */
router.patch(
  "/:id/review",
  reviewInvestigationController,
);

/**
 * Cancel an investigation.
 *
 * PATCH /api/investigations/:id/cancel
 */
router.patch(
  "/:id/cancel",
  cancelInvestigationController,
);

/**
 * Update an investigation.
 *
 * PATCH /api/investigations/:id
 */
router.patch(
  "/:id",
  validateBody(updateInvestigationSchema),
  updateInvestigationController,
);




export default router;