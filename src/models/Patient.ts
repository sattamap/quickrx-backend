import { Schema, model, type Document, type Types } from "mongoose";

export interface IPatient extends Document {
  userId: Types.ObjectId;
  patientId: string;
  name: string;
  age: number;
  dateOfBirth?: string;
  gender: "male" | "female" | "other";
  phone: string;
  address: string;
  allergies: string;
  notes: string;
  createdAt: Date;
  updatedAt: Date;
}

const patientSchema = new Schema<IPatient>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    patientId: {
      type: String,
      required: true,
      trim: true,
    },

    name: {
      type: String,
      required: true,
      trim: true,
    },

    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },

    dateOfBirth: {
      type: String,
      trim: true,
    },

    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    phone: {
      type: String,
      required: true,
      trim: true,
    },

    address: {
      type: String,
      required: true,
      trim: true,
    },

    allergies: {
      type: String,
      default: "",
      trim: true,
    },

    notes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

// A patient ID only needs to be unique within one doctor's account.
patientSchema.index(
  { userId: 1, patientId: 1 },
  { unique: true },
);

const Patient = model<IPatient>("Patient", patientSchema);

export default Patient;