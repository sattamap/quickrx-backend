import { Schema, model, type Document, type Types } from "mongoose";

export interface IRefreshSession extends Document {
  userId: Types.ObjectId;
  tokenHash: string;
  csrfTokenHash: string;
  familyId: string;
  expiresAt: Date;
  revokedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const refreshSessionSchema = new Schema<IRefreshSession>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    tokenHash: {
      type: String,
      required: true,
      unique: true,
    },

    csrfTokenHash: {
      type: String,
      required: true,
    },

    familyId: {
      type: String,
      required: true,
      index: true,
    },

    expiresAt: {
      type: Date,
      required: true,
    },

    revokedAt: {
      type: Date,
    },
  },
  { timestamps: true },
);

refreshSessionSchema.index(
  { expiresAt: 1 },
  { expireAfterSeconds: 0 },
);

const RefreshSession = model<IRefreshSession>(
  "RefreshSession",
  refreshSessionSchema,
);

export default RefreshSession;