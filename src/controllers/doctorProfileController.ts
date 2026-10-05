import type {
  Request,
  Response,
} from "express";

import { Types } from "mongoose";

import {
  getDoctorProfile,
  updateDoctorProfile,
  type DoctorProfileInput,
} from "../services/doctorProfileService";

const getAuthenticatedUserId = (
  req: Request,
): Types.ObjectId => {
  if (!req.userId) {
    throw new Error("Authentication required.");
  }

  return new Types.ObjectId(req.userId);
};

export const getDoctorProfileController =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const profile =
        await getDoctorProfile(userId);

      res.status(200).json({
        success: true,
        data: profile,
      });
    } catch (error) {
      console.error(
        "Get doctor profile failed:",
        error,
      );

      if (
        error instanceof Error &&
        error.message ===
          "Authentication required."
      ) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });

        return;
      }

      res.status(500).json({
        success: false,
        message:
          "Failed to get doctor profile.",
      });
    }
  };

export const updateDoctorProfileController =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const userId =
        getAuthenticatedUserId(req);

      const data =
        req.body as DoctorProfileInput;

      if (!data.doctorName?.trim()) {
        res.status(400).json({
          success: false,
          message:
            "Doctor name is required.",
        });

        return;
      }

      const profile =
        await updateDoctorProfile(userId, {
          doctorName:
            data.doctorName.trim(),

          qualification:
            data.qualification?.trim() ?? "",

          specialty:
            data.specialty?.trim() ??
            "Ophthalmology",

          registrationNumber:
            data.registrationNumber?.trim() ??
            "",

          phone:
            data.phone?.trim() ?? "",

          email:
            data.email?.trim() ?? "",

          clinicName:
            data.clinicName?.trim() ?? "",

          clinicAddress:
            data.clinicAddress?.trim() ?? "",
        });

      res.status(200).json({
        success: true,
        data: profile,
        message:
          "Doctor profile saved successfully.",
      });
    } catch (error) {
      console.error(
        "Update doctor profile failed:",
        error,
      );

      if (
        error instanceof Error &&
        error.message ===
          "Authentication required."
      ) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });

        return;
      }

      res.status(500).json({
        success: false,
        message:
          "Failed to save doctor profile.",
      });
    }
  };