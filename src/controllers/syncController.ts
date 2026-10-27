
import type { Request, Response } from "express";
import SyncJob from "../models/SyncJob";

/**
 * Create a synchronization job.
 * This controller is intended for administrator-only routes.
 */
export const createSyncJob = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    if (!req.userId) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });
      return;
    }

    const job = await SyncJob.create({
      requestedBy: req.userId,
      status: "pending",
    });

    res.status(201).json({
      success: true,
      job: {
        id: job.id,
        status: job.status,
        createdAt: job.createdAt,
      },
    });
  } catch (error) {
    console.error("Failed to create sync job:", error);

    res.status(500).json({
      success: false,
      message: "Could not create synchronization job.",
    });
  }
};

/**
 * Return the latest synchronization job.
 * The admin route middleware protects this endpoint.
 */
export const getLatestSyncJob = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const job = await SyncJob.findOne()
      .sort({ createdAt: -1 })
      .select(
        "status createdAt startedAt completedAt result errorMessage",
      )
      .lean();

    res.status(200).json({
      success: true,
      job: job
        ? {
            id: job._id.toString(),
            status: job.status,
            createdAt: job.createdAt,
            startedAt: job.startedAt,
            completedAt: job.completedAt,
            result: job.result,
            errorMessage: job.errorMessage,
          }
        : null,
    });
  } catch (error) {
    console.error("Failed to load sync job:", error);

    res.status(500).json({
      success: false,
      message: "Could not load synchronization status.",
    });
  }
};
