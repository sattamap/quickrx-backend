import type { Request, Response, NextFunction } from "express";
import {
  createPatient,
  getAllPatients,
  getPatientById,
  updatePatient,
  deletePatient,
} from "../services/patientService";

export const createPatientController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const patient = await createPatient(req.body);

    res.status(201).json({
      success: true,
      data: patient,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const patients = await getAllPatients();

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
    const patient = await getPatientById(req.params.id);

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
    const patient = await updatePatient(req.params.id, req.body);

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
    const patient = await deletePatient(req.params.id);

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