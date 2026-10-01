import PrescriptionSettings, {
  IPrescriptionSettings,
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

export const getPrescriptionSettings =
  async (): Promise<IPrescriptionSettings> => {
    let settings = await PrescriptionSettings.findOne();

    if (!settings) {
      settings = await PrescriptionSettings.create({});
    }

    return settings;
  };

export const updatePrescriptionSettings =
  async (
    data: PrescriptionSettingsInput,
  ): Promise<IPrescriptionSettings> => {
    let settings = await PrescriptionSettings.findOne();

    if (!settings) {
      settings = await PrescriptionSettings.create({
        ...data,
      });

      return settings;
    }

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
      settings.showClinicAddress =
        data.showClinicAddress;
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