import mongoose, { Document, Schema } from "mongoose";

export interface IDoctorProfile extends Document {
  doctorName: string;
  qualification: string;
  specialty: string;
  registrationNumber: string;
  phone: string;
  email: string;
  clinicName: string;
  clinicAddress: string;
  createdAt: Date;
  updatedAt: Date;
}

const doctorProfileSchema = new Schema<IDoctorProfile>(
  {
    doctorName: {
      type: String,
      required: true,
      trim: true,
    },

    qualification: {
      type: String,
      trim: true,
      default: "",
    },

    specialty: {
      type: String,
      trim: true,
      default: "Ophthalmology",
    },

    registrationNumber: {
      type: String,
      trim: true,
      default: "",
    },

    phone: {
      type: String,
      trim: true,
      default: "",
    },

    email: {
      type: String,
      trim: true,
      default: "",
    },

    clinicName: {
      type: String,
      trim: true,
      default: "",
    },

    clinicAddress: {
      type: String,
      trim: true,
      default: "",
    },
  },
  {
    timestamps: true,
  },
);

const DoctorProfile = mongoose.model<IDoctorProfile>(
  "DoctorProfile",
  doctorProfileSchema,
);

export default DoctorProfile;