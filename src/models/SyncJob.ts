import { Schema, model, type InferSchemaType } from "mongoose";

const syncJobSchema = new Schema(
  {
    status: {
      type: String,
      enum: ["pending", "running", "succeeded", "failed"],
      default: "pending",
      required: true,
      index: true,
    },
    claimedAt: { type: Date, default: null },
    claimTokenHash: { type: String, default: null, select: false },

    requestedBy: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    startedAt: {
      type: Date,
      default: null,
    },

    completedAt: {
      type: Date,
      default: null,
    },

    result: {
      collections: {
        type: Number,
        default: null,
      },
      documents: {
        type: Number,
        default: null,
      },
      preparedDatabase: {
        type: String,
        default: null,
      },
    },

    errorMessage: {
      type: String,
      default: null,
      maxlength: 500,
    },
  },
  {
    timestamps: true,
    versionKey: false,
  },
);

export type SyncJob = InferSchemaType<typeof syncJobSchema>;

export default model("SyncJob", syncJobSchema);
