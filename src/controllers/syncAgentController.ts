import crypto from "node:crypto";
import type { Request, Response } from "express";
import mongoose from "mongoose";
import SyncJob from "../models/SyncJob";

const isValidJobToken = (
  suppliedToken: unknown,
  storedHash: string | null | undefined,
): boolean => {
  if (
    typeof suppliedToken !== "string" ||
    !/^[a-f0-9]{64}$/i.test(suppliedToken) ||
    !storedHash ||
    !/^[a-f0-9]{64}$/i.test(storedHash)
  ) {
    return false;
  }

  const suppliedHash = crypto
    .createHash("sha256")
    .update(suppliedToken)
    .digest("hex");

  return crypto.timingSafeEqual(
    Buffer.from(suppliedHash, "hex"),
    Buffer.from(storedHash, "hex"),
  );
};

// Atomically claim one pending job.
export const claimSyncJob = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const claimToken = crypto.randomBytes(32).toString("hex");
    const claimTokenHash = crypto
      .createHash("sha256")
      .update(claimToken)
      .digest("hex");

    const job = await SyncJob.findOneAndUpdate(
      { status: "pending" },
      {
        $set: {
          status: "running",
          startedAt: new Date(),
          claimedAt: new Date(),
          claimTokenHash,
          completedAt: null,
          errorMessage: null,
        },
      },
      {
        new: true,
        sort: { createdAt: 1 },
      },
    ).select("_id createdAt");

    res.status(200).json({
      success: true,
      job: job
        ? {
            id: job.id,
            createdAt: job.createdAt,
            claimToken,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to claim synchronization job:", error);
    res.status(500).json({
      success: false,
      message: "Could not claim synchronization job.",
    });
  }
};

// Record a successful staging preparation.
export const completeSyncJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { collections, documents, preparedDatabase } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid synchronization job ID.",
      });
      return;
    }

    if (
      !Number.isSafeInteger(collections) ||
      collections < 0 ||
      !Number.isSafeInteger(documents) ||
      documents < 0 ||
      typeof preparedDatabase !== "string" ||
      !/^quickrx_prepare_[a-zA-Z0-9_-]+$/.test(preparedDatabase)
    ) {
      res.status(400).json({
        success: false,
        message: "Invalid synchronization result.",
      });
      return;
    }

    const currentJob = await SyncJob.findOne({
      _id: id,
      status: "running",
    }).select("+claimTokenHash");

    if (
      !currentJob ||
      !isValidJobToken(
        req.header("x-sync-job-token"),
        currentJob.claimTokenHash,
      )
    ) {
      res.status(409).json({
        success: false,
        message: "Job not found or claim token is invalid.",
      });
      return;
    }

    const job = await SyncJob.findOneAndUpdate(
      {
        _id: id,
        status: "running",
        claimTokenHash: currentJob.claimTokenHash,
      },
      {
        $set: {
          status: "succeeded",
          completedAt: new Date(),
          result: { collections, documents, preparedDatabase },
          errorMessage: null,
          claimTokenHash: null,
        },
      },
      { new: true },
    ).select("_id status");

    if (!job) {
      res.status(409).json({
        success: false,
        message: "Job has already been completed or changed.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: job.status,
    });
  } catch (error) {
    console.error("Failed to complete synchronization job:", error);
    res.status(500).json({
      success: false,
      message: "Could not update synchronization status.",
    });
  }
};

// Record a failure without returning internal details to the client.
export const failSyncJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { message } = req.body;

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid synchronization job ID.",
      });
      return;
    }

    if (typeof message !== "string" || !message.trim()) {
      res.status(400).json({
        success: false,
        message: "A failure message is required.",
      });
      return;
    }

    const currentJob = await SyncJob.findOne({
      _id: id,
      status: "running",
    }).select("+claimTokenHash");

    if (
      !currentJob ||
      !isValidJobToken(
        req.header("x-sync-job-token"),
        currentJob.claimTokenHash,
      )
    ) {
      res.status(409).json({
        success: false,
        message: "Job not found or claim token is invalid.",
      });
      return;
    }

    const job = await SyncJob.findOneAndUpdate(
      {
        _id: id,
        status: "running",
        claimTokenHash: currentJob.claimTokenHash,
      },
      {
        $set: {
          status: "failed",
          completedAt: new Date(),
          errorMessage: message.trim().slice(0, 500),
          claimTokenHash: null,
        },
      },
      { new: true },
    ).select("_id status");

    if (!job) {
      res.status(409).json({
        success: false,
        message: "Job has already been completed or changed.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      status: job.status,
    });
  } catch (error) {
    console.error("Failed to mark synchronization job as failed:", error);
    res.status(500).json({
      success: false,
      message: "Could not update synchronization status.",
    });
  }
};

export const checkSyncAgentAuth = (_req: Request, res: Response): void => {
  res.status(200).json({
    success: true,
    message: "Synchronization agent authentication successful.",
  });
};
