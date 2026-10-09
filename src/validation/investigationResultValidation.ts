import { z } from "zod";

/**
 * Validation schema for adding an investigation result.
 *
 * This endpoint is used when a patient returns with
 * a completed investigation/test report.
 *
 * Example:
 * - OCT RNFL result
 * - Visual field result
 * - OCT macula result
 */
export const addInvestigationResultSchema =
  z
    .object({
      /**
       * Test result/report.
       */
      result: z
        .string()
        .trim()
        .min(
          1,
          "Investigation result is required.",
        )
        .max(
          10000,
          "Investigation result must not exceed 10000 characters.",
        ),

      /**
       * Date on which the investigation/test
       * was actually performed.
       */
      testDate: z
        .string()
        .trim()
        .min(
          1,
          "Test date is required.",
        )
        .max(
          50,
          "Test date is invalid.",
        ),

      /**
       * Visit during which the doctor entered
       * or reviewed the investigation result.
       */
      resultVisitId: z
        .string()
        .trim()
        .min(
          1,
          "Result visit ID is required.",
        )
        .max(
          100,
          "Result visit ID is too long.",
        ),

      /**
       * Optional doctor's notes about the result.
       */
      notes: z
        .string()
        .trim()
        .max(
          5000,
          "Investigation notes must not exceed 5000 characters.",
        )
        .optional(),
    })
    .strict();

export type AddInvestigationResultInput =
  z.infer<
    typeof addInvestigationResultSchema
  >;