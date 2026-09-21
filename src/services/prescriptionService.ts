import Prescription, {
  type IPrescription,
} from "../models/Prescription";
import Patient from "../models/Patient";
import Visit from "../models/Visit";
import type { Types } from "mongoose";

const mapPrescription = (prescription: IPrescription) => ({
  id: prescription._id.toString(),
  patientId: prescription.patientId.toString(),
  visitId: prescription.visitId.toString(),
  prescriptionDate: prescription.prescriptionDate,
  medicines: prescription.medicines,
  spectaclePrescription: prescription.spectaclePrescription,
  advice: prescription.advice,
  followUp: prescription.followUp,
  createdAt: prescription.createdAt,
  updatedAt: prescription.updatedAt,
});

export interface CreatePrescriptionData {
  patientId: Types.ObjectId;
  visitId: Types.ObjectId;
  prescriptionDate: Date;
  medicines: IPrescription["medicines"];
  spectaclePrescription: IPrescription["spectaclePrescription"];
  advice?: string;
  followUp?: string;
}

/**
 * Create a new prescription.
 */
export const createPrescription = async (
  data: CreatePrescriptionData,
) => {
  const patient = await Patient.findById(data.patientId);

  if (!patient) {
    throw new Error("Patient not found.");
  }

  const visit = await Visit.findById(data.visitId);

  if (!visit) {
    throw new Error("Visit not found.");
  }

  if (visit.patientId.toString() !== data.patientId.toString()) {
    throw new Error(
      "The prescription patient does not match the visit patient.",
    );
  }

  const existingPrescription = await Prescription.findOne({
    visitId: data.visitId,
  });

  if (existingPrescription) {
    throw new Error(
      "A prescription already exists for this visit.",
    );
  }

  const prescription = await Prescription.create(data);

  return mapPrescription(prescription);
};

/**
 * Get all prescriptions.
 */
export const getAllPrescriptions = async () => {
  const prescriptions = await Prescription.find()
    .populate("patientId", "patientId name age gender")
    .populate("visitId", "visitDate chiefComplaint diagnosis")
    .sort({ prescriptionDate: -1 });

  return prescriptions.map((prescription) => ({
    id: prescription._id.toString(),

    patientId:
      typeof prescription.patientId === "object" &&
      prescription.patientId !== null &&
      "_id" in prescription.patientId
        ? String(prescription.patientId._id)
        : String(prescription.patientId),

    visitId:
      typeof prescription.visitId === "object" &&
      prescription.visitId !== null &&
      "_id" in prescription.visitId
        ? String(prescription.visitId._id)
        : String(prescription.visitId),

    prescriptionDate: prescription.prescriptionDate,
    medicines: prescription.medicines,
    spectaclePrescription: prescription.spectaclePrescription,
    advice: prescription.advice,
    followUp: prescription.followUp,
    createdAt: prescription.createdAt,
    updatedAt: prescription.updatedAt,
  }));
};

/**
 * Get prescription by MongoDB ID.
 */
export const getPrescriptionById = async (id: string) => {
  const prescription = await Prescription.findById(id);

  if (!prescription) {
    return null;
  }

  return mapPrescription(prescription);
};

/**
 * Get prescription for a specific visit.
 */
export const getPrescriptionByVisitId = async (
  visitId: string,
) => {
  const prescription = await Prescription.findOne({
    visitId,
  });

  if (!prescription) {
    return null;
  }

  return mapPrescription(prescription);
};

/**
 * Get all prescriptions for a patient.
 */
export const getPrescriptionsByPatientId = async (
  patientId: string,
) => {
  const prescriptions = await Prescription.find({
    patientId,
  }).sort({
    prescriptionDate: -1,
  });

  return prescriptions.map(mapPrescription);
};

/**
 * Update a prescription.
 */
export const updatePrescription = async (
  id: string,
  data: Partial<CreatePrescriptionData>,
) => {
  const prescription = await Prescription.findByIdAndUpdate(
    id,
    data,
    {
      new: true,
      runValidators: true,
    },
  );

  if (!prescription) {
    return null;
  }

  return mapPrescription(prescription);
};

/**
 * Delete a prescription.
 */
export const deletePrescription = async (id: string) => {
  const prescription = await Prescription.findByIdAndDelete(id);

  if (!prescription) {
    return null;
  }

  return mapPrescription(prescription);
};