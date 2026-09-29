import { Request, Response } from "express";

import {
  getDoctorProfile,
  updateDoctorProfile,
  type DoctorProfileInput,
} from "../services/doctorProfileService";

export const getDoctorProfileController = async (
  _req: Request,
  res: Response,
): Promise<void> => {
  try {
    const profile = await getDoctorProfile();

    res.status(200).json({
      success: true,
      data: profile,
    });
  } catch (error) {
    console.error("Get doctor profile failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to get doctor profile.",
    });
  }
};

export const updateDoctorProfileController = async (
  req: Request,
  res: Response,
): Promise<void> => {
  try {
    const data = req.body as DoctorProfileInput;

    if (!data.doctorName?.trim()) {
      res.status(400).json({
        success: false,
        message: "Doctor name is required.",
      });
      return;
    }

    const profile = await updateDoctorProfile({
      doctorName: data.doctorName.trim(),
      qualification: data.qualification?.trim() ?? "",
      specialty: data.specialty?.trim() ?? "",
      registrationNumber: data.registrationNumber?.trim() ?? "",
      phone: data.phone?.trim() ?? "",
      email: data.email?.trim() ?? "",
      clinicName: data.clinicName?.trim() ?? "",
      clinicAddress: data.clinicAddress?.trim() ?? "",
    });

    res.status(200).json({
      success: true,
      data: profile,
      message: "Doctor profile saved successfully.",
    });
  } catch (error) {
    console.error("Update doctor profile failed:", error);

    res.status(500).json({
      success: false,
      message: "Failed to save doctor profile.",
    });
  }
};