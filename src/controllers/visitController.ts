import type { Request, Response, NextFunction } from "express";
import { Types } from "mongoose";

import {
  createVisit,
  getAllVisits,
  getVisitById,
  getVisitsByPatientId,
  updateVisit,
  deleteVisit,
} from "../services/visitService";

const getAuthenticatedUserId = (
  req: Request,
): Types.ObjectId => {
  if (!req.userId) {
    throw new Error("Authentication required.");
  }

  return new Types.ObjectId(req.userId);
};

export const createVisitController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const visit = await createVisit(userId, req.body);

    res.status(201).json({
      success: true,
      data: visit,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitsController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const visits = await getAllVisits(userId);

    res.status(200).json({
      success: true,
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const visit = await getVisitById(
      userId,
      req.params.id,
    );

    if (!visit) {
      res.status(404).json({
        success: false,
        message: "Visit not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: visit,
    });
  } catch (error) {
    next(error);
  }
};

export const getPatientVisitsController = async (
  req: Request<{ patientId: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const visits = await getVisitsByPatientId(
      userId,
      req.params.patientId,
    );

    res.status(200).json({
      success: true,
      data: visits,
    });
  } catch (error) {
    next(error);
  }
};

export const updateVisitController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const visit = await updateVisit(
      userId,
      req.params.id,
      req.body,
    );

    if (!visit) {
      res.status(404).json({
        success: false,
        message: "Visit not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      data: visit,
    });
  } catch (error) {
    next(error);
  }
};

export const deleteVisitController = async (
  req: Request<{ id: string }>,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const userId = getAuthenticatedUserId(req);

    const visit = await deleteVisit(
      userId,
      req.params.id,
    );

    if (!visit) {
      res.status(404).json({
        success: false,
        message: "Visit not found.",
      });

      return;
    }

    res.status(200).json({
      success: true,
      message: "Visit deleted successfully.",
    });
  } catch (error) {
    next(error);
  }
};