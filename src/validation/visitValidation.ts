import { z } from "zod";

/**
 * Visual acuity validation.
 */
const visualAcuitySchema = z.object({
  right: z.string().trim().max(50).optional(),
  left: z.string().trim().max(50).optional(),
});

/**
 * Refraction validation.
 */
const refractionEyeSchema = z.object({
  sph: z.string().trim().max(30).optional(),
  cyl: z.string().trim().max(30).optional(),
  axis: z.string().trim().max(30).optional(),
  visualAcuity: z.string().trim().max(50).optional(),
});

const refractionSchema = z.object({
  right: refractionEyeSchema.optional(),
  left: refractionEyeSchema.optional(),
});

/**
 * IOP validation.
 */
const iopSchema = z.object({
  right: z.string().trim().max(30).optional(),
  left: z.string().trim().max(30).optional(),
});

/**
 * Anterior segment examination.
 */
const anteriorSegmentSchema = z.object({
  right: z.string().trim().max(2000).optional(),
  left: z.string().trim().max(2000).optional(),
});

/**
 * Fundus examination.
 */
const fundusSchema = z.object({
  right: z.string().trim().max(2000).optional(),
  left: z.string().trim().max(2000).optional(),
});

/**
 * Complete ophthalmic examination.
 */
const examinationSchema = z.object({
  visualAcuity: visualAcuitySchema.optional(),

  refraction: refractionSchema.optional(),

  iop: iopSchema.optional(),

  anteriorSegment: anteriorSegmentSchema.optional(),

  fundus: fundusSchema.optional(),
});

/**
 * Create visit validation.
 *
 * patientId and ageAtVisit come from the authenticated
 * application flow and are validated here as strings/numbers.
 *
 * userId is intentionally NOT accepted from the client.
 */
export const createVisitSchema = z.object({
  patientId: z
    .string()
    .trim()
    .min(1, "Patient ID is required.")
    .max(100, "Patient ID is too long."),

  ageAtVisit: z
    .number()
    .int("Age must be a whole number.")
    .min(0, "Age cannot be negative.")
    .max(150, "Please provide a valid age."),

  visitDate: z
    .string()
    .trim()
    .min(1, "Visit date is required.")
    .max(50, "Visit date is invalid."),

  chiefComplaint: z
    .string()
    .trim()
    .max(
      2000,
      "Chief complaint must not exceed 2000 characters.",
    ),

  examination: examinationSchema.optional(),

  diagnosis: z
    .string()
    .trim()
    .max(
      3000,
      "Diagnosis must not exceed 3000 characters.",
    ),

  clinicalNotes: z
    .string()
    .trim()
    .max(
      5000,
      "Clinical notes must not exceed 5000 characters.",
    ),
});

/**
 * Update visit validation.
 *
 * All fields are optional because an edit request may
 * update only part of the visit.
 *
 * patientId is allowed because the existing service
 * validates ownership and visit/patient consistency.
 */
export const updateVisitSchema = z
  .object({
    patientId: createVisitSchema.shape.patientId.optional(),

    ageAtVisit:
      createVisitSchema.shape.ageAtVisit.optional(),

    visitDate:
      createVisitSchema.shape.visitDate.optional(),

    chiefComplaint:
      createVisitSchema.shape.chiefComplaint.optional(),

    examination:
      examinationSchema.optional(),

    diagnosis:
      createVisitSchema.shape.diagnosis.optional(),

    clinicalNotes:
      createVisitSchema.shape.clinicalNotes.optional(),
  })
  .strict();

export type CreateVisitInput = z.infer<
  typeof createVisitSchema
>;

export type UpdateVisitInput = z.infer<
  typeof updateVisitSchema
>;