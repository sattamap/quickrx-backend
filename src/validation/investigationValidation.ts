import { z } from "zod";

/**
 * Investigation eye validation.
 *
 * OD = Right eye
 * OS = Left eye
 * OU = Both eyes
 * NA = Not applicable
 */
const investigationEyeSchema = z.enum(
  ["OD", "OS", "OU", "NA"],
  {
    error: "Invalid eye selection.",
  },
);

/**
 * Investigation status validation.
 *
 * ordered   = Test has been advised/ordered.
 * completed = Test result has been entered.
 * reviewed  = Doctor has reviewed the result.
 * cancelled = Investigation was cancelled.
 */
const investigationStatusSchema = z.enum(
  [
    "ordered",
    "completed",
    "reviewed",
    "cancelled",
  ],
  {
    error: "Invalid investigation status.",
  },
);

/**
 * Create investigation validation.
 *
 * userId is intentionally NOT accepted from the client.
 *
 * Ownership is determined from the authenticated user
 * on the backend.
 */
export const createInvestigationSchema = z
  .object({
    patientId: z
      .string()
      .trim()
      .min(1, "Patient ID is required.")
      .max(100, "Patient ID is too long."),

    orderedVisitId: z
      .string()
      .trim()
      .min(1, "Ordered visit ID is required.")
      .max(100, "Ordered visit ID is too long."),

    resultVisitId: z
      .string()
      .trim()
      .max(100, "Result visit ID is too long.")
      .optional(),

    testName: z
      .string()
      .trim()
      .min(1, "Investigation/test name is required.")
      .max(
        200,
        "Investigation/test name must not exceed 200 characters.",
      ),

    eye: investigationEyeSchema,

    orderedDate: z
      .string()
      .trim()
      .min(1, "Ordered date is required.")
      .max(50, "Ordered date is invalid."),

    testDate: z
      .string()
      .trim()
      .max(50, "Test date is invalid.")
      .optional(),

    result: z
      .string()
      .trim()
      .max(
        10000,
        "Investigation result must not exceed 10000 characters.",
      )
      .optional(),

    notes: z
      .string()
      .trim()
      .max(
        5000,
        "Investigation notes must not exceed 5000 characters.",
      )
      .optional(),

    status: investigationStatusSchema.optional(),

    reviewedAt: z
      .string()
      .trim()
      .max(50, "Review date is invalid.")
      .optional(),
  })
  .strict();

/**
 * Update investigation validation.
 *
 * All fields are optional so that an investigation can be
 * updated progressively as the test moves through its
 * lifecycle:
 *
 * ordered -> completed -> reviewed
 *
 * patientId and orderedVisitId are accepted for backwards
 * compatibility, but the service should not allow an
 * investigation to be moved to another patient or another
 * ordering visit.
 */
export const updateInvestigationSchema = z
  .object({
    patientId:
      createInvestigationSchema.shape.patientId.optional(),

    orderedVisitId:
      createInvestigationSchema.shape.orderedVisitId.optional(),

    resultVisitId:
      createInvestigationSchema.shape.resultVisitId.optional(),

    testName:
      createInvestigationSchema.shape.testName.optional(),

    eye:
      createInvestigationSchema.shape.eye.optional(),

    orderedDate:
      createInvestigationSchema.shape.orderedDate.optional(),

    testDate:
      createInvestigationSchema.shape.testDate.optional(),

    result:
      createInvestigationSchema.shape.result.optional(),

    notes:
      createInvestigationSchema.shape.notes.optional(),

    status:
      createInvestigationSchema.shape.status.optional(),

    reviewedAt:
      createInvestigationSchema.shape.reviewedAt.optional(),
  })
  .strict();

export type CreateInvestigationInput = z.infer<
  typeof createInvestigationSchema
>;

export type UpdateInvestigationInput = z.infer<
  typeof updateInvestigationSchema
>;