import { Request, Response } from "express";

import {
  getPrescriptionSettings,
  updatePrescriptionSettings,
  type PrescriptionSettingsInput,
} from "../services/prescriptionSettingsService";

export const getPrescriptionSettingsController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const settings = await getPrescriptionSettings();

    res.status(200).json({
      success: true,
      data: settings,
    });
  } catch (error) {
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
      const data =
        req.body as PrescriptionSettingsInput;

      const settings =
        await updatePrescriptionSettings({
          defaultAdvice:
            typeof data.defaultAdvice === "string"
              ? data.defaultAdvice.trim()
              : undefined,

          defaultFollowUp:
            typeof data.defaultFollowUp === "string"
              ? data.defaultFollowUp.trim()
              : undefined,

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
        });

      res.status(200).json({
        success: true,
        data: settings,
        message:
          "Prescription settings saved successfully.",
      });
    } catch (error) {
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