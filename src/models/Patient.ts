import {
  Schema,
  model,
  type Document,
  type Types,
} from "mongoose";

export interface IPatient extends Document {
  userId: Types.ObjectId;
  patientId: string;

  // Required patient information
  name: string;
  age: number;
  gender: "male" | "female" | "other";

  // Optional patient information
  dateOfBirth?: string;
  phone?: string;
  address?: string;
  allergies?: string;
  notes?: string;

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

    // Required
    name: {
      type: String,
      required: true,
      trim: true,
    },

    // Required
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },

    // Optional
    dateOfBirth: {
      type: String,
      trim: true,
      default: undefined,
    },

    // Required
    gender: {
      type: String,
      enum: ["male", "female", "other"],
      required: true,
    },

    // Optional
    phone: {
      type: String,
      trim: true,
      default: undefined,
    },

    // Optional
    address: {
      type: String,
      trim: true,
      default: undefined,
    },

    // Optional
    allergies: {
      type: String,
      trim: true,
      default: undefined,
    },

    // Optional
    notes: {
      type: String,
      trim: true,
      default: undefined,
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