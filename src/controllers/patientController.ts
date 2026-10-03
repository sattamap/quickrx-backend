import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../services/patientService";

const getAuthenticatedUserId = (req: Request): Types.ObjectId => {
  if (!req.userId) {
    throw new Error("Authentication required.");
  }

  return new Types.ObjectId(req.userId);
};

export const createPatientController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const patient = await createPatient({
      ...req.body,
      userId,
    });

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const patients = await getAllPatients(userId);

    res.status(200).json({
      success: true,
      data: patients,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const patient = await getPatientById(
      userId,
      req.params.id,
    );

    if (!patient) {
      res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePatientController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const patient = await updatePatient(
      userId,
      req.params.id,
      req.body,
    );

    if (!patient) {
      res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePatientController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const patient = await deletePatient(
      userId,
      req.params.id,
    );

    if (!patient) {
      res.status(404).json({
        success: false,
        message: "Patient not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Patient deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};