
import type { Request, Response } from "express";
import { Types } from "mongoose";

import {
  getPrescriptionSettings,
  updatePrescriptionSettings,
  type PrescriptionSettingsInput,
} from "../services/prescriptionSettingsService";

const getAuthenticatedUserId = (
  req: Request,
): Types.ObjectId => {
  if (!req.userId) {
    throw new Error("Authentication required.");
  }

  return new Types.ObjectId(req.userId);
};

const isAuthenticationError = (
  error: unknown,
): boolean =>
  error instanceof Error &&
  error.message === "Authentication required.";

export const getPrescriptionSettingsController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const settings = await getPrescriptionSettings(userId);

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
    if (isAuthenticationError(error)) {
      res.status(401).json({
        success: false,
        message: "Authentication required.",
      });

      return;
    }

    console.error(
      "Get prescription settings failed:",
      error,
    );

    res.status(500).json({
      success: false,
      message: "Failed to get prescription settings.",
    });
  }
};

export const updatePrescriptionSettingsController =
  async (
    req: Request,
    res: Response,
  ): Promise<void> => {
    try {
      const userId = getAuthenticatedUserId(req);

      const data =
        req.body as PrescriptionSettingsInput;

      const settings =
        await updatePrescriptionSettings(userId, {
          // Default prescription text
          defaultAdvice:
            typeof data.defaultAdvice === "string"
              ? data.defaultAdvice.trim()
              : undefined,

          defaultFollowUp:
            typeof data.defaultFollowUp === "string"
              ? data.defaultFollowUp.trim()
              : undefined,

          // Doctor and clinic information visibility
          showDoctorPhone:
            typeof data.showDoctorPhone === "boolean"
              ? data.showDoctorPhone
              : undefined,

          showDoctorEmail:
            typeof data.showDoctorEmail === "boolean"
              ? data.showDoctorEmail
              : undefined,

          showRegistrationNumber:
            typeof data.showRegistrationNumber ===
            "boolean"
              ? data.showRegistrationNumber
              : undefined,

          showClinicAddress:
            typeof data.showClinicAddress === "boolean"
              ? data.showClinicAddress
              : undefined,

          // Prescription content visibility
          showPatientId:
            typeof data.showPatientId === "boolean"
              ? data.showPatientId
              : undefined,

          showDiagnosis:
            typeof data.showDiagnosis === "boolean"
              ? data.showDiagnosis
              : undefined,

          showSpectaclePrescription:
            typeof data.showSpectaclePrescription ===
            "boolean"
              ? data.showSpectaclePrescription
              : undefined,

          showSignature:
            typeof data.showSignature === "boolean"
              ? data.showSignature
              : undefined,

          // Chamber footer visibility
          showChamberFooter:
            typeof data.showChamberFooter === "boolean"
              ? data.showChamberFooter
              : undefined,

          // Chamber footer content
          footerHeading:
            typeof data.footerHeading === "string"
              ? data.footerHeading.trim()
              : undefined,

          visitingHours:
            typeof data.visitingHours === "string"
              ? data.visitingHours.trim()
              : undefined,

          serialBookingPhone:
            typeof data.serialBookingPhone === "string"
              ? data.serialBookingPhone.trim()
              : undefined,

          weeklyClosingDay:
            typeof data.weeklyClosingDay === "string"
              ? data.weeklyClosingDay.trim()
              : undefined,
        });

      res.status(200).json({
        success: true,
        data: settings,
        message:
          "Prescription settings saved successfully.",
      });
    } catch (error) {
      if (isAuthenticationError(error)) {
        res.status(401).json({
          success: false,
          message: "Authentication required.",
        });

        return;
      }

      console.error(
        "Update prescription settings failed:",
        error,
      );

      res.status(500).json({
        success: false,
        message:
          "Failed to save prescription settings.",
      });
    }
  };
