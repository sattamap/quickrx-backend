
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

  // Prescription footer settings
  showChamberFooter?: boolean;
  footerHeading?: string;
  visitingHours?: string;
  serialBookingPhone?: string;
  weeklyClosingDay?: string;
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
 * If two requests try to create it simultaneously,
 * the unique userId index rejects the second request.
 * In that case, read the document created by the first.
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

/**
 * Get the authenticated doctor's prescription settings.
 */
export const getPrescriptionSettings = async (
  userId: Types.ObjectId,
): Promise<IPrescriptionSettings> => {
  return findOrCreateSettings(userId);
};

/**
 * Update only the settings fields provided by the caller.
 * Fields omitted from the request remain unchanged.
 */
export const updatePrescriptionSettings = async (
  userId: Types.ObjectId,
  data: PrescriptionSettingsInput,
): Promise<IPrescriptionSettings> => {
  const settings = await findOrCreateSettings(userId);

  // Default prescription text
  if (data.defaultAdvice !== undefined) {
    settings.defaultAdvice = data.defaultAdvice;
  }

  if (data.defaultFollowUp !== undefined) {
    settings.defaultFollowUp = data.defaultFollowUp;
  }

  // Doctor and clinic display settings
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

  // Prescription content display settings
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

  // Prescription footer settings
  if (data.showChamberFooter !== undefined) {
    settings.showChamberFooter = data.showChamberFooter;
  }

  if (data.footerHeading !== undefined) {
    settings.footerHeading = data.footerHeading;
  }

  if (data.visitingHours !== undefined) {
    settings.visitingHours = data.visitingHours;
  }

  if (data.serialBookingPhone !== undefined) {
    settings.serialBookingPhone = data.serialBookingPhone;
  }

  if (data.weeklyClosingDay !== undefined) {
    settings.weeklyClosingDay = data.weeklyClosingDay;
  }

  await settings.save();

  return settings;
};
