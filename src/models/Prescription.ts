import { Schema, model, type Document, type Types } from "mongoose";

export interface IPrescriptionMedicine {
  id: string;
  name: string;
  strength: string;
  form: string;
  dose: string;
  frequency: string;
  duration: string;
  instructions: string;
}

export interface ISpectacleEyePrescription {
  sph: string;
  cyl: string;
  axis: string;
  visualAcuity: string;
}

export interface ISpectaclePrescription {
  right: ISpectacleEyePrescription;
  left: ISpectacleEyePrescription;
  nearAddition: string;
  pd: string;
}

export interface IPrescription extends Document {
  patientId: Types.ObjectId;
  visitId: Types.ObjectId;
  prescriptionDate: Date;
  medicines: IPrescriptionMedicine[];
  spectaclePrescription: ISpectaclePrescription;
  advice: string;
  followUp: string;
  createdAt: Date;
  updatedAt: Date;
}

const prescriptionMedicineSchema = new Schema<IPrescriptionMedicine>(
  {
    id: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    strength: {
      type: String,
      default: "",
      trim: true,
    },
    form: {
      type: String,
      default: "",
      trim: true,
    },
    dose: {
      type: String,
      default: "",
      trim: true,
    },
    frequency: {
      type: String,
      default: "",
      trim: true,
    },
    duration: {
      type: String,
      default: "",
      trim: true,
    },
    instructions: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const spectacleEyePrescriptionSchema =
  new Schema<ISpectacleEyePrescription>(
    {
      sph: {
        type: String,
        default: "",
        trim: true,
      },
      cyl: {
        type: String,
        default: "",
        trim: true,
      },
      axis: {
        type: String,
        default: "",
        trim: true,
      },
      visualAcuity: {
        type: String,
        default: "",
        trim: true,
      },
    },
    { _id: false },
  );

const spectaclePrescriptionSchema =
  new Schema<ISpectaclePrescription>(
    {
      right: {
        type: spectacleEyePrescriptionSchema,
        required: true,
      },
      left: {
        type: spectacleEyePrescriptionSchema,
        required: true,
      },
      nearAddition: {
        type: String,
        default: "",
        trim: true,
      },
      pd: {
        type: String,
        default: "",
        trim: true,
      },
    },
    { _id: false },
  );

const prescriptionSchema = new Schema<IPrescription>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    visitId: {
      type: Schema.Types.ObjectId,
      ref: "Visit",
      required: true,
      unique: true,
      index: true,
    },

    prescriptionDate: {
      type: Date,
      required: true,
    },

    medicines: {
      type: [prescriptionMedicineSchema],
      default: [],
    },

    spectaclePrescription: {
      type: spectaclePrescriptionSchema,
      required: true,
    },

    advice: {
      type: String,
      default: "",
      trim: true,
    },

    followUp: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

prescriptionSchema.index({
  patientId: 1,
  prescriptionDate: -1,
});

const Prescription = model<IPrescription>(
  "Prescription",
  prescriptionSchema,
);

export default Prescription;