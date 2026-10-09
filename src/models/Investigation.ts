import {
  Schema,
  model,
  type Document,
  type Types,
} from "mongoose";

export type InvestigationEye =
  | "OD"
  | "OS"
  | "OU"
  | "NA";

export type InvestigationStatus =
  | "ordered"
  | "completed"
  | "reviewed"
  | "cancelled";

export interface IInvestigation extends Document {
  patientId: Types.ObjectId;

  orderedVisitId: Types.ObjectId;

  resultVisitId?: Types.ObjectId;

  testName: string;

  eye: InvestigationEye;

  orderedDate: Date;

  testDate?: Date;

  result: string;

  notes: string;

  status: InvestigationStatus;

  reviewedAt?: Date;

  createdAt: Date;

  updatedAt: Date;
}

const investigationSchema =
  new Schema<IInvestigation>(
    {
      patientId: {
        type: Schema.Types.ObjectId,
        ref: "Patient",
        required: true,
        index: true,
      },

      orderedVisitId: {
        type: Schema.Types.ObjectId,
        ref: "Visit",
        required: true,
        index: true,
      },

      resultVisitId: {
        type: Schema.Types.ObjectId,
        ref: "Visit",
        required: false,
        index: true,
      },

      testName: {
        type: String,
        required: true,
        trim: true,
        maxlength: 200,
      },

      eye: {
        type: String,
        enum: ["OD", "OS", "OU", "NA"],
        default: "NA",
        required: true,
      },

      orderedDate: {
        type: Date,
        required: true,
      },

      testDate: {
        type: Date,
        required: false,
      },

      result: {
        type: String,
        default: "",
        trim: true,
        maxlength: 10000,
      },

      notes: {
        type: String,
        default: "",
        trim: true,
        maxlength: 5000,
      },

      status: {
        type: String,
        enum: [
          "ordered",
          "completed",
          "reviewed",
          "cancelled",
        ],
        default: "ordered",
        required: true,
      },

      reviewedAt: {
        type: Date,
        required: false,
      },
    },
    {
      timestamps: true,
    },
  );

investigationSchema.index({
  patientId: 1,
  orderedDate: -1,
});

investigationSchema.index({
  patientId: 1,
  status: 1,
});

const Investigation = model<IInvestigation>(
  "Investigation",
  investigationSchema,
);

export default Investigation;