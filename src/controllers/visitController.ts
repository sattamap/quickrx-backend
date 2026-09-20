import type { Request, Response, NextFunction } from "express";
import {
  createVisit,
  getAllVisits,
  getVisitById,
  getVisitsByPatientId,
  updateVisit,
  deleteVisit,
} from "../services/visitService";

export const createVisitController = async (
  req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const visit = await createVisit(req.body);

    res.status(201).json({
      success: true,
      data: visit,
    });
  } catch (error) {
    next(error);
  }
};

export const getVisitsController = async (
  _req: Request,
  res: Response,
  next: NextFunction,
): Promise<void> => {
  try {
    const visits = await getAllVisits();

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
    const visit = await getVisitById(req.params.id);

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
    const visits = await getVisitsByPatientId(req.params.patientId);

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
    const visit = await updateVisit(req.params.id, req.body);

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
    const visit = await deleteVisit(req.params.id);

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