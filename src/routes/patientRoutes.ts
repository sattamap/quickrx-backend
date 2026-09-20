import { Router } from "express";
import {
  createPatientController,
  getPatientsController,
  getPatientController,
  updatePatientController,
  deletePatientController,
} from "../controllers/patientController";

const router = Router();

router.post("/", createPatientController);

router.get("/", getPatientsController);

router.get("/:id", getPatientController);

router.put("/:id", updatePatientController);

router.delete("/:id", deletePatientController);

export default router;