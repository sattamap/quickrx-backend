import Prescription, {
  type IPrescription,
} from "../models/Prescription";
import Patient from "../models/Patient";
import Visit from "../models/Visit";
import type { Types } from "mongoose";

const mapPrescription = (prescription: IPrescription) => ({
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
});

export interface CreatePrescriptionData {
  patientId: Types.ObjectId;
  visitId: Types.ObjectId;
  prescriptionDate: Date;
  medicines: IPrescription["medicines"];
  spectaclePrescription: IPrescription["spectaclePrescription"];
  advice?: string;
  followUp?: string;
};

/**
 * Create a new prescription.
 */
export const createPrescription = async (
  userId: Types.ObjectId,
  data: CreatePrescriptionData,
) => {
  // Verify that the patient belongs to the authenticated user.
  const patient = await Patient.findOne({
    _id: data.patientId,
    userId,
  });

  if (!patient) {
    throw new Error("Patient not found.");
  }

  // Verify that the visit exists.
  const visit = await Visit.findById(data.visitId);

  if (!visit) {
    throw new Error("Visit not found.");
  }

  // Verify that the visit belongs to the selected patient.
  if (
    visit.patientId.toString() !==
    data.patientId.toString()
  ) {
    throw new Error(
      "The prescription patient does not match the visit patient.",
    );
  }

  // Because the patient has already been verified as belonging
  // to the authenticated user, the visit is also within that
  // user's ownership boundary.
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
 * Get all prescriptions belonging to the authenticated user.
 */
export const getAllPrescriptions = async (
  userId: Types.ObjectId,
) => {
  const patients = await Patient.find({
    userId,
  }).select("_id");

  const patientIds = patients.map(
    (patient) => patient._id,
  );

  const prescriptions = await Prescription.find({
    patientId: { $in: patientIds },
  })
    .populate(
      "patientId",
      "patientId name age gender",
    )
    .populate(
      "visitId",
      "visitDate chiefComplaint diagnosis",
    )
    .sort({
      prescriptionDate: -1,
    });

  return prescriptions.map(mapPrescription);
};

/**
 * Get prescription by MongoDB ID.
 */
export const getPrescriptionById = async (
  userId: Types.ObjectId,
  id: string,
) => {
  const prescription = await Prescription.findById(id);

  if (!prescription) {
    return null;
  }

  // Verify ownership through the patient.
  const patient = await Patient.findOne({
    _id: prescription.patientId,
    userId,
  });

  if (!patient) {
    return null;
  }

  return mapPrescription(prescription);
};

/**
 * Get prescription for a specific visit.
 */
export const getPrescriptionByVisitId = async (
  userId: Types.ObjectId,
  visitId: string,
) => {
  const visit = await Visit.findById(visitId);

  if (!visit) {
    return null;
  }

  // Verify that the visit's patient belongs to the user.
  const patient = await Patient.findOne({
    _id: visit.patientId,
    userId,
  });

  if (!patient) {
    return null;
  }

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
  userId: Types.ObjectId,
  patientId: string,
) => {
  // Verify patient ownership first.
  const patient = await Patient.findOne({
    _id: patientId,
    userId,
  });

  if (!patient) {
    return [];
  }

  const prescriptions = await Prescription.find({
    patientId: patient._id,
  }).sort({
    prescriptionDate: -1,
  });

  return prescriptions.map(mapPrescription);
};

/**
 * Update a prescription.
 */
export const updatePrescription = async (
  userId: Types.ObjectId,
  id: string,
  data: Partial<CreatePrescriptionData>,
) => {
  const existingPrescription =
    await Prescription.findById(id);

  if (!existingPrescription) {
    return null;
  }

  // Verify ownership through the prescription's patient.
  const patient = await Patient.findOne({
    _id: existingPrescription.patientId,
    userId,
  });

  if (!patient) {
    return null;
  }

  // Do not allow a prescription to be moved to
  // another patient or another visit.
  const {
    patientId: _ignoredPatientId,
    visitId: _ignoredVisitId,
    ...updateData
  } = data;

  const prescription =
    await Prescription.findByIdAndUpdate(
      id,
      updateData,
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
export const deletePrescription = async (
  userId: Types.ObjectId,
  id: string,
) => {
  const prescription =
    await Prescription.findById(id);

  if (!prescription) {
    return null;
  }

  // Verify ownership before deletion.
  const patient = await Patient.findOne({
    _id: prescription.patientId,
    userId,
  });

  if (!patient) {
    return null;
  }

  await Prescription.findByIdAndDelete(id);

  return mapPrescription(prescription);
};