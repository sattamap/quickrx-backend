
import type { Request, Response } from "express";
import mongoose from "mongoose";

import User from "../models/User";
import { revokeAllUserSessions } from "../services/authService";

/**
 * List all registered doctors.
 *
 * Optional query:
 * ?status=pending
 * ?status=approved
 * ?status=rejected
 */
export const getDoctorsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const status = req.query.status;

    const filter: Record<string, unknown> = {
      role: "doctor",
    };

    if (status !== undefined) {
      if (
        typeof status !== "string" ||
        !["pending", "approved", "rejected"].includes(status)
      ) {
        res.status(400).json({
          success: false,
          message: "Invalid approval status filter.",
        });
        return;
      }

      filter.approvalStatus = status;
    }

    const doctors = await User.find(filter)
      .select("_id name email approvalStatus isActive createdAt updatedAt")
      .sort({ createdAt: -1 })
      .lean();

    res.status(200).json({
      success: true,
      data: doctors,
      count: doctors.length,
    });
  } catch (error) {
    console.error("Get doctors controller error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to retrieve doctors.",
    });
  }
};

/**
 * Approve or reject a doctor's registration.
 *
 * Expected body:
 * { "approvalStatus": "approved" }
 * or
 * { "approvalStatus": "rejected" }
 */
export const updateDoctorApprovalController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { approvalStatus } = req.body as {
      approvalStatus?: unknown;
    };

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
      return;
    }

    if (
      approvalStatus !== "approved" &&
      approvalStatus !== "rejected"
    ) {
      res.status(400).json({
        success: false,
        message: "Approval status must be approved or rejected.",
      });
      return;
    }

    const doctor = await User.findOne({
      _id: id,
      role: "doctor",
    });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor account not found.",
      });
      return;
    }

    doctor.approvalStatus = approvalStatus;
    await doctor.save();

    // Revoke existing sessions when access is not approved.
    if (approvalStatus !== "approved") {
      await revokeAllUserSessions(doctor._id);
    }

    res.status(200).json({
      success: true,
      message:
        approvalStatus === "approved"
          ? "Doctor approved successfully."
          : "Doctor registration rejected.",
      data: {
        id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        approvalStatus: doctor.approvalStatus,
        isActive: doctor.isActive,
      },
    });
  } catch (error) {
    console.error("Update doctor approval error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update doctor approval.",
    });
  }
};

/**
 * Activate or deactivate a doctor account.
 *
 * Expected body:
 * { "isActive": true }
 * or
 * { "isActive": false }
 */
export const updateDoctorActiveStatusController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const { id } = req.params;
    const { isActive } = req.body as {
      isActive?: unknown;
    };

    if (!mongoose.isValidObjectId(id)) {
      res.status(400).json({
        success: false,
        message: "Invalid doctor ID.",
      });
      return;
    }

    if (typeof isActive !== "boolean") {
      res.status(400).json({
        success: false,
        message: "isActive must be true or false.",
      });
      return;
    }

    const doctor = await User.findOne({
      _id: id,
      role: "doctor",
    });

    if (!doctor) {
      res.status(404).json({
        success: false,
        message: "Doctor account not found.",
      });
      return;
    }

    doctor.isActive = isActive;
    await doctor.save();

    // Immediately invalidate the doctor's refresh sessions
    // when the account is deactivated.
    if (!isActive) {
      await revokeAllUserSessions(doctor._id);
    }

    res.status(200).json({
      success: true,
      message: isActive
        ? "Doctor account activated successfully."
        : "Doctor account deactivated successfully.",
      data: {
        id: doctor._id.toString(),
        name: doctor.name,
        email: doctor.email,
        approvalStatus: doctor.approvalStatus,
        isActive: doctor.isActive,
      },
    });
  } catch (error) {
    console.error("Update doctor active status error:", error);

    res.status(500).json({
      success: false,
      message: "Unable to update doctor account status.",
    });
  }
};
