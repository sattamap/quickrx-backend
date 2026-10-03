import type { NextFunction, Request, Response } from "express";
import { Types } from "mongoose";

import {
  createPrescription,
  getAllPrescriptions,
  getPrescriptionById,
  getPrescriptionByVisitId,
  getPrescriptionsByPatientId,
  updatePrescription,
  deletePrescription,
} from "../services/prescriptionService";

const getAuthenticatedUserId = (
  req: Request,
): Types.ObjectId => {
  if (!req.userId) {
    throw new Error("Authentication required.");
  }

  return new Types.ObjectId(req.userId);
};

export const createPrescriptionController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const prescription = await createPrescription(
      userId,
      req.body,
    );

    res.status(201).json({
      success: true,
      data: prescription,
    });
  } catch (error) {
    next(error);
  }
};

export const getPrescriptionsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const prescriptions =
      await getAllPrescriptions(userId);

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
    const userId = getAuthenticatedUserId(req);

    const prescription = await getPrescriptionById(
      userId,
      req.params.id,
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

export const getPrescriptionByVisitController = async (
  req: Request<{ visitId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const prescription =
      await getPrescriptionByVisitId(
        userId,
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
    const userId = getAuthenticatedUserId(req);

    const prescriptions =
      await getPrescriptionsByPatientId(
        userId,
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
    const userId = getAuthenticatedUserId(req);

    const prescription =
      await updatePrescription(
        userId,
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
    const userId = getAuthenticatedUserId(req);

    const prescription =
      await deletePrescription(
        userId,
        req.params.id,
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
      message: "Prescription deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};