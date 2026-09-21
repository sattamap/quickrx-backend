import type { NextFunction, Request, Response } from "express";
import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionByVisitId,
  getPrescriptionsByPatientId,
  updatePrescription,
  deletePrescription,
} from "../services/prescriptionService";

export const createPrescriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const prescription = await createPrescription(req.body);

    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const prescriptions = await getAllPrescriptions();

    res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const prescription = await getPrescriptionById(req.params.id);

    if (!prescription) {
      res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionByVisitController = async (
  req: Request<{ visitId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const prescription = await getPrescriptionByVisitId(
      req.params.visitId,
    );

    if (!prescription) {
      res.status(404).json({
        success: false,
        message: "Prescription not found for this visit.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientPrescriptionsController = async (
  req: Request<{ patientId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const prescriptions = await getPrescriptionsByPatientId(
      req.params.patientId,
    );

    res.status(200).json({
      success: true,
      data: prescriptions,
    });
  } catch (error) {
    next(error);
  }
};

export const updatePrescriptionController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const prescription = await updatePrescription(
      req.params.id,
      req.body,
    );

    if (!prescription) {
      res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const deletePrescriptionController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const prescription = await deletePrescription(req.params.id);

    if (!prescription) {
      res.status(404).json({
        success: false,
        message: "Prescription not found.",
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: "Prescription deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};