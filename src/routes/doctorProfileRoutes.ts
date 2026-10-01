import { Router } from "express";

import {
  getDoctorProfileController,
  updateDoctorProfileController,
} from "../controllers/doctorProfileController";

const router = Router();

router.get("/", getDoctorProfileController);
router.put("/", updateDoctorProfileController);

export default router;