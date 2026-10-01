import { Router } from "express";

import {
  getPrescriptionSettingsController,
  updatePrescriptionSettingsController,
} from "../controllers/prescriptionSettingsController";

const router = Router();

router.get(
  "/",
  getPrescriptionSettingsController,
);

router.put(
  "/",
  updatePrescriptionSettingsController,
);

export default router;