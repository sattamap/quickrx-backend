import type { Types } from "mongoose";

import PrescriptionSettings, {
  type IPrescriptionSettings,
} from "../models/PrescriptionSettings";

export interface PrescriptionSettingsInput {
  defaultAdvice?: string;
  defaultFollowUp?: string;

  showDoctorPhone?: boolean;
  showDoctorEmail?: boolean;
  showRegistrationNumber?: boolean;
  showClinicAddress?: boolean;

  showPatientId?: boolean;
  showDiagnosis?: boolean;
  showSpectaclePrescription?: boolean;
  showSignature?: boolean;
}

const isDuplicateKeyError = (error: unknown): boolean =>
  typeof error === "object" &&
  error !== null &&
  "code" in error &&
  (error as { code?: number }).code === 11000;

/**
 * Get this doctor's settings, creating the default
 * settings document the first time.
 *
 * If two requests try to create it at the same moment,
 * the unique userId index rejects the second one and we
 * simply read the document the first one created.
 */
const findOrCreateSettings = async (
  userId: Types.ObjectId,
): Promise<IPrescriptionSettings> => {
  const existing = await PrescriptionSettings.findOne({
    userId,
  });

  if (existing) {
    return existing;
  }

  try {
    return await PrescriptionSettings.create({ userId });
  } catch (error) {
    if (!isDuplicateKeyError(error)) {
      throw error;
    }

    const created = await PrescriptionSettings.findOne({
      userId,
    });

    if (!created) {
      throw new Error("Unable to load prescription settings.");
    }

    return created;
  }
};

export const getPrescriptionSettings = async (
  userId: Types.ObjectId,
): Promise<IPrescriptionSettings> => {
  return findOrCreateSettings(userId);
};

export const updatePrescriptionSettings = async (
  userId: Types.ObjectId,
  data: PrescriptionSettingsInput,
): Promise<IPrescriptionSettings> => {
  const settings = await findOrCreateSettings(userId);

  if (data.defaultAdvice !== undefined) {
    settings.defaultAdvice = data.defaultAdvice;
  }

  if (data.defaultFollowUp !== undefined) {
    settings.defaultFollowUp = data.defaultFollowUp;
  }

  if (data.showDoctorPhone !== undefined) {
    settings.showDoctorPhone = data.showDoctorPhone;
  }

  if (data.showDoctorEmail !== undefined) {
    settings.showDoctorEmail = data.showDoctorEmail;
  }

  if (data.showRegistrationNumber !== undefined) {
    settings.showRegistrationNumber =
      data.showRegistrationNumber;
  }

  if (data.showClinicAddress !== undefined) {
    settings.showClinicAddress = data.showClinicAddress;
  }

  if (data.showPatientId !== undefined) {
    settings.showPatientId = data.showPatientId;
  }

  if (data.showDiagnosis !== undefined) {
    settings.showDiagnosis = data.showDiagnosis;
  }

  if (data.showSpectaclePrescription !== undefined) {
    settings.showSpectaclePrescription =
      data.showSpectaclePrescription;
  }

  if (data.showSignature !== undefined) {
    settings.showSignature = data.showSignature;
  }

  await settings.save();

  return settings;
};