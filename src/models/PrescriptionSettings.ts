
import mongoose, {
  Document,
  Schema,
  Types,
} from "mongoose";

export interface IPrescriptionSettings extends Document {
  userId: Types.ObjectId;

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

  // Prescription footer settings
  showChamberFooter: boolean;
  footerHeading: string;
  visitingHours: string;
  serialBookingPhone: string;
  weeklyClosingDay: string;

  createdAt: Date;
  updatedAt: Date;
}

const prescriptionSettingsSchema =
  new Schema<IPrescriptionSettings>(
    {
      /**
       * Owner of these settings. One settings document
       * per doctor (enforced by the unique index).
       */
      userId: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: true,
        unique: true,
      },

      // Default prescription text
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

      // Doctor and clinic display settings
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

      // Prescription content display settings
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

      // Prescription footer settings
      showChamberFooter: {
        type: Boolean,
        default: true,
      },

      footerHeading: {
        type: String,
        trim: true,
        default: "রোগী দেখার সময় ও সিরিয়াল",
      },

      visitingHours: {
        type: String,
        trim: true,
        default: "বিকাল ৫টা থেকে রাত ৯টা পর্যন্ত",
      },

      serialBookingPhone: {
        type: String,
        trim: true,
        default: "০১৯২১৯০৯১১",
      },

      weeklyClosingDay: {
        type: String,
        trim: true,
        default: "প্রতি শুক্রবার",
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
