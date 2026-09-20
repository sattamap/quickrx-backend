import { Router } from "express";
import {
  createVisitController,
  getVisitsController,
  getVisitController,
  getPatientVisitsController,
  updateVisitController,
  deleteVisitController,
} from "../controllers/visitController";

const router = Router();

router.post("/", createVisitController);

router.get("/", getVisitsController);

router.get("/patient/:patientId", getPatientVisitsController);

router.get("/:id", getVisitController);

router.put("/:id", updateVisitController);

router.delete("/:id", deleteVisitController);

export default router;