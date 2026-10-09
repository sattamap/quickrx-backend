import { Types } from "mongoose";

import Investigation, {
  type InvestigationStatus,
} from "../models/Investigation";

import Patient from "../models/Patient";
import Visit from "../models/Visit";

import type {
  CreateInvestigationInput,
  UpdateInvestigationInput,
} from "../validation/investigationValidation";

/**
 * Service-layer error.
 *
 * Controllers can use the statusCode to return an
 * appropriate HTTP response.
 */
export class InvestigationServiceError extends Error {
  statusCode: number;

  constructor(message: string, statusCode = 400) {
    super(message);

    this.name = "InvestigationServiceError";
    this.statusCode = statusCode;
  }
}

/**
 * Convert a string ID into a MongoDB ObjectId.
 */
function toObjectId(
  id: string,
  fieldName: string,
): Types.ObjectId {
  if (!Types.ObjectId.isValid(id)) {
    throw new InvestigationServiceError(
      `Invalid ${fieldName}.`,
      400,
    );
  }

  return new Types.ObjectId(id);
}

/**
 * Make sure the patient belongs to the authenticated user.
 */
async function verifyPatientOwnership(
  userId: string,
  patientId: string,
) {
  const patientObjectId = toObjectId(
    patientId,
    "patient ID",
  );

  const patient = await Patient.findOne({
    _id: patientObjectId,
    userId,
  }).select("_id");

  if (!patient) {
    throw new InvestigationServiceError(
      "Patient not found.",
      404,
    );
  }

  return patient;
}

/**
 * Make sure a visit belongs to the authenticated user
 * and the specified patient.
 */
/**
 * Make sure a visit belongs to the authenticated user
 * and the specified patient.
 *
 * Ownership is verified through the Patient document
 * because Visit does not contain a userId field.
 */
async function verifyVisitOwnership(
  userId: string,
  patientId: string,
  visitId: string,
) {
  const patientObjectId = toObjectId(
    patientId,
    "patient ID",
  );

  const visitObjectId = toObjectId(
    visitId,
    "visit ID",
  );

  // First verify that the patient belongs
  // to the authenticated user.
  const patient = await Patient.findOne({
    _id: patientObjectId,
    userId,
  }).select("_id");

  if (!patient) {
    throw new InvestigationServiceError(
      "Patient not found.",
      404,
    );
  }

  // Then verify that the visit belongs
  // to this patient.
  const visit = await Visit.findOne({
    _id: visitObjectId,
    patientId: patientObjectId,
  }).select("_id patientId");

  if (!visit) {
    throw new InvestigationServiceError(
      "Visit not found for this patient.",
      404,
    );
  }

  return visit;
}
/**
 * Create a new investigation.
 *
 * This is normally used when a doctor advises/orders
 * an investigation during a visit.
 */
export async function createInvestigation(
  userId: string,
  input: CreateInvestigationInput,
) {
  await verifyPatientOwnership(
    userId,
    input.patientId,
  );

  await verifyVisitOwnership(
    userId,
    input.patientId,
    input.orderedVisitId,
  );

  /**
   * If a result visit is supplied during creation,
   * verify that it belongs to the same patient.
   */
  if (input.resultVisitId) {
    await verifyVisitOwnership(
      userId,
      input.patientId,
      input.resultVisitId,
    );
  }

  const investigation = await Investigation.create({
    patientId: toObjectId(
      input.patientId,
      "patient ID",
    ),

    orderedVisitId: toObjectId(
      input.orderedVisitId,
      "ordered visit ID",
    ),

    ...(input.resultVisitId
      ? {
          resultVisitId: toObjectId(
            input.resultVisitId,
            "result visit ID",
          ),
        }
      : {}),

    testName: input.testName,

    eye: input.eye,

    orderedDate: new Date(input.orderedDate),

    ...(input.testDate
      ? {
          testDate: new Date(input.testDate),
        }
      : {}),

    result: input.result ?? "",

    notes: input.notes ?? "",

    status: input.status ?? "ordered",

    ...(input.reviewedAt
      ? {
          reviewedAt: new Date(input.reviewedAt),
        }
      : {}),
  });

  return investigation;
}

/**
 * Get all investigations for a patient.
 *
 * Only investigations belonging to a patient owned by
 * the authenticated user are returned.
 */
export async function getInvestigationsByPatientId(
  userId: string,
  patientId: string,
) {
  await verifyPatientOwnership(
    userId,
    patientId,
  );

  const patientObjectId = toObjectId(
    patientId,
    "patient ID",
  );

  return Investigation.find({
    patientId: patientObjectId,
  }).sort({
    orderedDate: -1,
    createdAt: -1,
  });
}

/**
 * Get one investigation by ID.
 */
export async function getInvestigationById(
  userId: string,
  investigationId: string,
) {
  const investigationObjectId = toObjectId(
    investigationId,
    "investigation ID",
  );

  const investigation =
    await Investigation.findById(
      investigationObjectId,
    );

  if (!investigation) {
    throw new InvestigationServiceError(
      "Investigation not found.",
      404,
    );
  }

  /**
   * Do not trust the investigation document alone.
   * Verify that its patient belongs to the authenticated
   * user.
   */
  await verifyPatientOwnership(
    userId,
    investigation.patientId.toString(),
  );

  return investigation;
}

/**
 * Get pending investigations for a patient.
 *
 * These are the investigations that still need a result
 * or doctor's review.
 */
export async function getPendingInvestigations(
  userId: string,
  patientId: string,
) {
  await verifyPatientOwnership(
    userId,
    patientId,
  );

  const patientObjectId = toObjectId(
    patientId,
    "patient ID",
  );

  return Investigation.find({
    patientId: patientObjectId,
    status: {
      $in: ["ordered", "completed"],
    },
  }).sort({
    orderedDate: 1,
  });
}

/**
 * Update an investigation.
 *
 * Important:
 * patientId and orderedVisitId are NOT allowed to
 * actually move an existing investigation to another
 * patient or ordering visit.
 */
export async function updateInvestigation(
  userId: string,
  investigationId: string,
  input: UpdateInvestigationInput,
) {
  const investigationObjectId = toObjectId(
    investigationId,
    "investigation ID",
  );

  const investigation =
    await Investigation.findById(
      investigationObjectId,
    );

  if (!investigation) {
    throw new InvestigationServiceError(
      "Investigation not found.",
      404,
    );
  }

  /**
   * First verify ownership of the investigation's
   * existing patient.
   */
  await verifyPatientOwnership(
    userId,
    investigation.patientId.toString(),
  );

  /**
   * Prevent changing the patient.
   */
  if (
    input.patientId &&
    input.patientId !==
      investigation.patientId.toString()
  ) {
    throw new InvestigationServiceError(
      "An investigation cannot be moved to another patient.",
      400,
    );
  }

  /**
   * Prevent changing the original ordering visit.
   */
  if (
    input.orderedVisitId &&
    input.orderedVisitId !==
      investigation.orderedVisitId.toString()
  ) {
    throw new InvestigationServiceError(
      "The ordering visit cannot be changed.",
      400,
    );
  }

  /**
   * If a result visit is being supplied, make sure
   * it belongs to the same patient and doctor.
   */
  if (input.resultVisitId) {
    await verifyVisitOwnership(
      userId,
      investigation.patientId.toString(),
      input.resultVisitId,
    );
  }

  /**
   * Apply only mutable fields.
   */
  if (input.testName !== undefined) {
    investigation.testName = input.testName;
  }

  if (input.eye !== undefined) {
    investigation.eye = input.eye;
  }

  if (input.orderedDate !== undefined) {
    investigation.orderedDate = new Date(
      input.orderedDate,
    );
  }

  if (input.testDate !== undefined) {
    investigation.testDate = input.testDate
      ? new Date(input.testDate)
      : undefined;
  }

  if (input.result !== undefined) {
    investigation.result = input.result;
  }

  if (input.notes !== undefined) {
    investigation.notes = input.notes;
  }

  if (input.resultVisitId !== undefined) {
    investigation.resultVisitId =
      input.resultVisitId
        ? toObjectId(
            input.resultVisitId,
            "result visit ID",
          )
        : undefined;
  }

  if (input.status !== undefined) {
    investigation.status = input.status;
  }

  if (input.reviewedAt !== undefined) {
    investigation.reviewedAt =
      input.reviewedAt
        ? new Date(input.reviewedAt)
        : undefined;
  }

  await investigation.save();

  return investigation;
}

/**
 * Add a test result to an investigation.
 *
 * This is a dedicated operation because entering a result
 * is an important part of the clinical workflow.
 */
export async function addInvestigationResult(
  userId: string,
  investigationId: string,
  result: string,
  testDate: string,
  resultVisitId: string,
  notes = "",
) {
  const investigation =
    await getInvestigationById(
      userId,
      investigationId,
    );

  await verifyVisitOwnership(
    userId,
    investigation.patientId.toString(),
    resultVisitId,
  );

  if (!result.trim()) {
    throw new InvestigationServiceError(
      "Investigation result is required.",
      400,
    );
  }

  if (!testDate.trim()) {
    throw new InvestigationServiceError(
      "Test date is required.",
      400,
    );
  }

  investigation.result = result.trim();

  investigation.notes = notes.trim();

  investigation.testDate = new Date(
    testDate,
  );

  investigation.resultVisitId =
    toObjectId(
      resultVisitId,
      "result visit ID",
    );

  investigation.status = "completed";

  await investigation.save();

  return investigation;
}

/**
 * Mark an investigation as reviewed by the doctor.
 */
export async function reviewInvestigation(
  userId: string,
  investigationId: string,
) {
  const investigation =
    await getInvestigationById(
      userId,
      investigationId,
    );

  if (!investigation.result.trim()) {
    throw new InvestigationServiceError(
      "An investigation must have a result before it can be reviewed.",
      400,
    );
  }

  investigation.status = "reviewed";
  investigation.reviewedAt = new Date();

  await investigation.save();

  return investigation;
}

/**
 * Cancel an investigation.
 */
export async function cancelInvestigation(
  userId: string,
  investigationId: string,
) {
  const investigation =
    await getInvestigationById(
      userId,
      investigationId,
    );

  if (investigation.status === "reviewed") {
    throw new InvestigationServiceError(
      "A reviewed investigation cannot be cancelled.",
      400,
    );
  }

  investigation.status = "cancelled";

  await investigation.save();

  return investigation;
}