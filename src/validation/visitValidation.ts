import { z } from "zod";

/**
 * Visual acuity validation.
 *
 * Each eye contains separate unaided and aided
 * visual acuity values.
 */
const visualAcuityEyeSchema = z.object({
  unaided: z
    .string()
    .trim()
    .max(50, "Unaided visual acuity is too long.")
    .optional(),

  aided: z
    .string()
    .trim()
    .max(50, "Aided visual acuity is too long.")
    .optional(),
});

const visualAcuitySchema = z.object({
  right: visualAcuityEyeSchema.optional(),
  left: visualAcuityEyeSchema.optional(),
});

/**
 * Refraction validation.
 */
const refractionEyeSchema = z.object({
  sph: z.string().trim().max(30, "SPH value is too long.").optional(),

  cyl: z.string().trim().max(30, "CYL value is too long.").optional(),

  axis: z.string().trim().max(30, "AXIS value is too long.").optional(),

  visualAcuity: z
    .string()
    .trim()
    .max(50, "Visual acuity is too long.")
    .optional(),
});

const refractionSchema = z.object({
  right: refractionEyeSchema.optional(),
  left: refractionEyeSchema.optional(),
});

/**
 * Intraocular pressure validation.
 */
const iopSchema = z.object({
  right: z
    .string()
    .trim()
    .max(30, "Right eye IOP value is too long.")
    .optional(),

  left: z.string().trim().max(30, "Left eye IOP value is too long.").optional(),
});

/**
 * Anterior segment examination.
 */
const anteriorSegmentSchema = z.object({
  right: z
    .string()
    .trim()
    .max(2000, "Right eye anterior segment findings are too long.")
    .optional(),

  left: z
    .string()
    .trim()
    .max(2000, "Left eye anterior segment findings are too long.")
    .optional(),
});

/**
 * Fundus examination.
 */
const fundusSchema = z.object({
  right: z
    .string()
    .trim()
    .max(2000, "Right eye fundus findings are too long.")
    .optional(),

  left: z
    .string()
    .trim()
    .max(2000, "Left eye fundus findings are too long.")
    .optional(),
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
 * Vital signs validation.
 *
 * All vital signs are optional because they may not be
 * recorded during every ophthalmology visit.
 */
const vitalSignsSchema = z.object({
  weight: z
    .number()
    .min(0, "Weight cannot be negative.")
    .max(500, "Please provide a valid weight.")
    .nullable()
    .optional(),

  height: z
    .number()
    .min(0, "Height cannot be negative.")
    .max(300, "Please provide a valid height.")
    .nullable()
    .optional(),

  bloodPressure: z
    .string()
    .trim()
    .max(20, "Blood pressure value is too long.")
    .optional(),
});

/**
 * Create visit validation.
 *
 * userId is intentionally NOT accepted from the client.
 * It comes from the authenticated access token.
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
    .min(1, "Chief complaint is required.")
    .max(2000, "Chief complaint must not exceed 2000 characters."),

  vitalSigns: vitalSignsSchema.optional(),

  examination: examinationSchema.optional(),

  diagnosis: z
    .string()
    .trim()
    .max(3000, "Diagnosis must not exceed 3000 characters."),

  clinicalNotes: z
    .string()
    .trim()
    .max(5000, "Clinical notes must not exceed 5000 characters."),
});

/**
 * Update visit validation.
 *
 * patientId is accepted by the request schema for
 * backwards compatibility, but the service deliberately
 * ignores it so a visit cannot be moved to another patient.
 */
export const updateVisitSchema = z
  .object({
    patientId: createVisitSchema.shape.patientId.optional(),

    ageAtVisit: createVisitSchema.shape.ageAtVisit.optional(),

    visitDate: createVisitSchema.shape.visitDate.optional(),

    chiefComplaint: createVisitSchema.shape.chiefComplaint.optional(),

    vitalSigns: vitalSignsSchema.optional(),

    examination: examinationSchema.optional(),

    diagnosis: createVisitSchema.shape.diagnosis.optional(),

    clinicalNotes: createVisitSchema.shape.clinicalNotes.optional(),
  })
  .strict();

export type CreateVisitInput = z.infer<typeof createVisitSchema>;

export type UpdateVisitInput = z.infer<typeof updateVisitSchema>;
