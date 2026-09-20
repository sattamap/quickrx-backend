import { Schema, model, type Document, type Types } from "mongoose";

export interface IVisualAcuity {
  unaided: string;
  aided: string;
}

export interface IRefraction {
  sph: string;
  cyl: string;
  axis: string;
  visualAcuity: string;
}

export interface IEyeExamination {
  visualAcuity: {
    right: IVisualAcuity;
    left: IVisualAcuity;
  };

  refraction: {
    right: IRefraction;
    left: IRefraction;
  };

  iop: {
    right: string;
    left: string;
  };

  anteriorSegment: {
    right: string;
    left: string;
  };

  fundus: {
    right: string;
    left: string;
  };
}

export interface IVisit extends Document {
  patientId: Types.ObjectId;
  ageAtVisit: number;
  visitDate: Date;
  chiefComplaint: string;
  examination: IEyeExamination;
  diagnosis: string;
  clinicalNotes: string;
  createdAt: Date;
  updatedAt: Date;
}

const visualAcuitySchema = new Schema<IVisualAcuity>(
  {
    unaided: {
      type: String,
      default: "",
      trim: true,
    },
    aided: {
      type: String,
      default: "",
      trim: true,
    },
  },
  { _id: false },
);

const refractionSchema = new Schema<IRefraction>(
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

const eyeExaminationSchema = new Schema<IEyeExamination>(
  {
    visualAcuity: {
      right: {
        type: visualAcuitySchema,
        required: true,
      },
      left: {
        type: visualAcuitySchema,
        required: true,
      },
    },

    refraction: {
      right: {
        type: refractionSchema,
        required: true,
      },
      left: {
        type: refractionSchema,
        required: true,
      },
    },

    iop: {
      right: {
        type: String,
        default: "",
        trim: true,
      },
      left: {
        type: String,
        default: "",
        trim: true,
      },
    },

    anteriorSegment: {
      right: {
        type: String,
        default: "",
        trim: true,
      },
      left: {
        type: String,
        default: "",
        trim: true,
      },
    },

    fundus: {
      right: {
        type: String,
        default: "",
        trim: true,
      },
      left: {
        type: String,
        default: "",
        trim: true,
      },
    },
  },
  { _id: false },
);

const visitSchema = new Schema<IVisit>(
  {
    patientId: {
      type: Schema.Types.ObjectId,
      ref: "Patient",
      required: true,
      index: true,
    },

    ageAtVisit: {
      type: Number,
      required: true,
      min: 0,
      max: 150,
    },

    visitDate: {
      type: Date,
      required: true,
    },

    chiefComplaint: {
      type: String,
      required: true,
      trim: true,
    },

    examination: {
      type: eyeExaminationSchema,
      required: true,
    },

    diagnosis: {
      type: String,
      default: "",
      trim: true,
    },

    clinicalNotes: {
      type: String,
      default: "",
      trim: true,
    },
  },
  {
    timestamps: true,
  },
);

visitSchema.index({
  patientId: 1,
  visitDate: -1,
});

const Visit = model<IVisit>("Visit", visitSchema);

export default Visit;