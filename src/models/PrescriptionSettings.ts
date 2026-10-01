import mongoose, {
  Document,
  Schema,
} from "mongoose";

export interface IPrescriptionSettings extends Document {
  defaultAdvice: string;
  defaultFollowUp: string;

  showDoctorPhone: boolean;
  showDoctorEmail: boolean;
  showRegistrationNumber: boolean;
  showClinicAddress: boolean;

  showPatientId: boolean;
  showDiagnosis: boolean;
  showSpectaclePrescription: boolean;
  showSignature: boolean;

  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSettingsSchema =
  new Schema<IPrescriptionSettings>(
    {
      defaultAdvice: {
        type: String,
        trim: true,
        default: "",
      },

      defaultFollowUp: {
        type: String,
        trim: true,
        default: "",
      },

      showDoctorPhone: {
        type: Boolean,
        default: true,
      },

      showDoctorEmail: {
        type: Boolean,
        default: false,
      },

      showRegistrationNumber: {
        type: Boolean,
        default: true,
      },

      showClinicAddress: {
        type: Boolean,
        default: true,
      },

      showPatientId: {
        type: Boolean,
        default: true,
      },

      showDiagnosis: {
        type: Boolean,
        default: true,
      },

      showSpectaclePrescription: {
        type: Boolean,
        default: true,
      },

      showSignature: {
        type: Boolean,
        default: true,
      },
    },
    {
      timestamps: true,
    },
  );

const PrescriptionSettings =
  mongoose.model<IPrescriptionSettings>(
    "PrescriptionSettings",
    prescriptionSettingsSchema,
  );

export default PrescriptionSettings;