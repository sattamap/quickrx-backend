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

const router = Router();

// Create prescription
router.post("/", createPrescriptionController);

// Get all prescriptions
router.get("/", getPrescriptionsController);

// Get prescriptions for a specific patient
router.get(
  "/patient/:patientId",
  getPatientPrescriptionsController,
);

// Get prescription for a specific visit
router.get(
  "/visit/:visitId",
  getPrescriptionByVisitController,
);

// Get prescription by ID
router.get("/:id", getPrescriptionController);

// Update prescription
router.put("/:id", updatePrescriptionController);

// Delete prescription
router.delete("/:id", deletePrescriptionController);

export default router;