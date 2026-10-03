import { z } from "zod";

/**
 * Individual medicine validation.
 */
const prescriptionMedicineSchema = z
  .object({
    id: z
      .string()
      .trim()
      .min(1, "Medicine ID is required.")
      .max(100, "Medicine ID is too long."),

    name: z
      .string()
      .trim()
      .min(1, "Medicine name is required.")
      .max(200, "Medicine name must not exceed 200 characters."),

    strength: z
      .string()
      .trim()
      .max(100, "Medicine strength must not exceed 100 characters."),

    form: z
      .string()
      .trim()
      .max(100, "Medicine form must not exceed 100 characters."),

    dose: z
      .string()
      .trim()
      .max(200, "Medicine dose must not exceed 200 characters."),

    frequency: z
      .string()
      .trim()
      .max(
        200,
        "Medicine frequency must not exceed 200 characters.",
      ),

    duration: z
      .string()
      .trim()
      .max(
        200,
        "Medicine duration must not exceed 200 characters.",
      ),

    instructions: z
      .string()
      .trim()
      .max(
        1000,
        "Medicine instructions must not exceed 1000 characters.",
      ),
  })
  .strict();

/**
 * One eye's spectacle prescription.
 */
const spectacleEyeSchema = z
  .object({
    sph: z
      .string()
      .trim()
      .max(30, "SPH value is too long."),

    cyl: z
      .string()
      .trim()
      .max(30, "CYL value is too long."),

    axis: z
      .string()
      .trim()
      .max(30, "Axis value is too long."),

    visualAcuity: z
      .string()
      .trim()
      .max(50, "Visual acuity value is too long."),
  })
  .strict();

/**
 * Complete spectacle prescription.
 */
const spectaclePrescriptionSchema = z
  .object({
    right: spectacleEyeSchema,

    left: spectacleEyeSchema,

    nearAddition: z
      .string()
      .trim()
      .max(30, "Near addition value is too long."),

    pd: z
      .string()
      .trim()
      .max(50, "PD value is too long."),
  })
  .strict();

/**
 * Create prescription validation.
 *
 * userId is intentionally NOT accepted.
 *
 * Ownership is determined by the authenticated user
 * on the backend.
 */
export const createPrescriptionSchema = z
  .object({
    patientId: z
      .string()
      .trim()
      .min(1, "Patient ID is required.")
      .max(100, "Patient ID is too long."),

    visitId: z
      .string()
      .trim()
      .min(1, "Visit ID is required.")
      .max(100, "Visit ID is too long."),

    prescriptionDate: z
      .string()
      .trim()
      .min(1, "Prescription date is required.")
      .max(50, "Prescription date is invalid."),

    medicines: z
      .array(prescriptionMedicineSchema)
      .max(100, "A prescription cannot contain more than 100 medicines."),

    spectaclePrescription:
      spectaclePrescriptionSchema,

    advice: z
      .string()
      .trim()
      .max(
        5000,
        "Advice must not exceed 5000 characters.",
      ),

    followUp: z
      .string()
      .trim()
      .max(
        1000,
        "Follow-up instructions must not exceed 1000 characters.",
      ),
  })
  .strict();

/**
 * Update prescription validation.
 *
 * All fields are optional so partial updates are possible.
 */
export const updatePrescriptionSchema = z
  .object({
    patientId: createPrescriptionSchema.shape.patientId.optional(),

    visitId: createPrescriptionSchema.shape.visitId.optional(),

    prescriptionDate:
      createPrescriptionSchema.shape.prescriptionDate.optional(),

    medicines:
      createPrescriptionSchema.shape.medicines.optional(),

    spectaclePrescription:
      createPrescriptionSchema.shape.spectaclePrescription.optional(),

    advice:
      createPrescriptionSchema.shape.advice.optional(),

    followUp:
      createPrescriptionSchema.shape.followUp.optional(),
  })
  .strict();

export type CreatePrescriptionInput = z.infer<
  typeof createPrescriptionSchema
>;

export type UpdatePrescriptionInput = z.infer<
  typeof updatePrescriptionSchema
>;