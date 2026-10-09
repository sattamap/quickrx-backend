import type {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  InvestigationServiceError,
  createInvestigation,
  getInvestigationsByPatientId,
  getInvestigationById,
  getPendingInvestigations,
  updateInvestigation,
  addInvestigationResult,
  reviewInvestigation,
  cancelInvestigation,
} from "../services/investigationService";

/**
 * Get the authenticated user's ID.
 *
 * The authentication middleware should attach the user
 * to the request before these controllers are executed.
 *
 * Adjust this helper if your existing auth middleware
 * uses a different request property.
 */
function getAuthenticatedUserId(
  req: Request,
): string {
  const userId = req.userId;

  if (!userId) {
    throw new InvestigationServiceError(
      "Authentication required.",
      401,
    );
  }

  return userId;
}

/**
 * Safely get a route parameter.
 *
 * Express can type route parameters as string | string[].
 * We only accept a single string value.
 */
function getRouteParam(
  req: Request,
  paramName: string,
): string {
  const value = req.params[paramName];

  if (typeof value !== "string") {
    throw new InvestigationServiceError(
      `${paramName} is invalid.`,
      400,
    );
  }

  return value;
}

/**
 * Handle service-layer errors.
 */
function handleServiceError(
  res: Response,
  error: unknown,
) {
  if (
    error instanceof InvestigationServiceError
  ) {
    return res.status(error.statusCode).json({
      success: false,
      message: error.message,
    });
  }

  return null;
}

/**
 * Create investigation.
 *
 * POST /api/investigations
 */
export async function createInvestigationController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    /**
     * req.body has already been validated
     * and transformed by validateBody().
     */
    const investigation =
      await createInvestigation(
        userId,
        req.body,
      );

    return res.status(201).json({
      success: true,
      message:
        "Investigation created successfully.",
      data: investigation,
    });
  } catch (error) {
    const handled =
      handleServiceError(
        res,
        error,
      );

    if (handled) {
      return handled;
    }

    return next(error);
  }
}

/**
 * Get all investigations for a patient.
 *
 * GET /api/investigations/patient/:patientId
 */
export async function getInvestigationsByPatientController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const patientId =
      getRouteParam(
        req,
        "patientId",
      );

    const investigations =
      await getInvestigationsByPatientId(
        userId,
        patientId,
      );

    return res.status(200).json({
      success: true,
      data: investigations,
    });
  } catch (error) {
    const handled =
      handleServiceError(
        res,
        error,
      );

    if (handled) {
      return handled;
    }

    return next(error);
  }
}

/**
 * Get one investigation.
 *
 * GET /api/investigations/:id
 */
export async function getInvestigationController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const investigationId =
      getRouteParam(
        req,
        "id",
      );

    const investigation =
      await getInvestigationById(
        userId,
        investigationId,
      );

    return res.status(200).json({
      success: true,
      data: investigation,
    });
  } catch (error) {
    const handled =
      handleServiceError(
        res,
        error,
      );

    if (handled) {
      return handled;
    }

    return next(error);
  }
}

/**
 * Get pending investigations for a patient.
 *
 * GET /api/investigations/patient/:patientId/pending
 */
export async function getPendingInvestigationsController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const patientId =
      getRouteParam(
        req,
        "patientId",
      );

    const investigations =
      await getPendingInvestigations(
        userId,
        patientId,
      );

    return res.status(200).json({
      success: true,
      data: investigations,
    });
  } catch (error) {
    const handled =
      handleServiceError(
        res,
        error,
      );

    if (handled) {
      return handled;
    }

    return next(error);
  }
}

/**
 * Update investigation.
 *
 * PATCH /api/investigations/:id
 */
export async function updateInvestigationController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const investigationId =
      getRouteParam(
        req,
        "id",
      );

    /**
     * req.body has already been validated
     * and transformed by validateBody().
     */
    const investigation =
      await updateInvestigation(
        userId,
        investigationId,
        req.body,
      );

    return res.status(200).json({
      success: true,
      message:
        "Investigation updated successfully.",
      data: investigation,
    });
  } catch (error) {
    const handled =
      handleServiceError(
        res,
        error,
      );

    if (handled) {
      return handled;
    }

    return next(error);
  }
}

/**
 * Add an investigation result.
 *
 * PATCH /api/investigations/:id/result
 */
export async function addInvestigationResultController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const investigationId =
      getRouteParam(
        req,
        "id",
      );

    const {
      result,
      testDate,
      resultVisitId,
      notes,
    } = req.body;

    if (
      typeof result !== "string" ||
      !result.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Investigation result is required.",
      });
    }

    if (
      typeof testDate !== "string" ||
      !testDate.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Test date is required.",
      });
    }

    if (
      typeof resultVisitId !== "string" ||
      !resultVisitId.trim()
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Result visit ID is required.",
      });
    }

    if (
      notes !== undefined &&
      typeof notes !== "string"
    ) {
      return res.status(400).json({
        success: false,
        message:
          "Investigation notes must be a string.",
      });
    }

    const investigation =
      await addInvestigationResult(
        userId,
        investigationId,
        result,
        testDate,
        resultVisitId,
        notes ?? "",
      );

    return res.status(200).json({
      success: true,
      message:
        "Investigation result added successfully.",
      data: investigation,
    });
  } catch (error) {
    const handled =
      handleServiceError(
        res,
        error,
      );

    if (handled) {
      return handled;
    }

    return next(error);
  }
}

/**
 * Mark investigation as reviewed.
 *
 * PATCH /api/investigations/:id/review
 */
export async function reviewInvestigationController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const investigationId =
      getRouteParam(
        req,
        "id",
      );

    const investigation =
      await reviewInvestigation(
        userId,
        investigationId,
      );

    return res.status(200).json({
      success: true,
      message:
        "Investigation reviewed successfully.",
      data: investigation,
    });
  } catch (error) {
    const handled =
      handleServiceError(
        res,
        error,
      );

    if (handled) {
      return handled;
    }

    return next(error);
  }
}

/**
 * Cancel investigation.
 *
 * PATCH /api/investigations/:id/cancel
 */
export async function cancelInvestigationController(
  req: Request,
  res: Response,
  next: NextFunction,
) {
  try {
    const userId =
      getAuthenticatedUserId(req);

    const investigationId =
      getRouteParam(
        req,
        "id",
      );

    const investigation =
      await cancelInvestigation(
        userId,
        investigationId,
      );

    return res.status(200).json({
      success: true,
      message:
        "Investigation cancelled successfully.",
      data: investigation,
    });
  } catch (error) {
    const handled =
      handleServiceError(
        res,
        error,
      );

    if (handled) {
      return handled;
    }

    return next(error);
  }
}