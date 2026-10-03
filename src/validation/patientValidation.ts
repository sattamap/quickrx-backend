import { z } from "zod";

/**
 * Common patient fields.
 *
 * These limits are intentionally reasonable for
 * ordinary patient registration data.
 */
const patientFields = {
  patientId: z
    .string()
    .trim()
    .min(1, "Patient ID is required.")
    .max(50, "Patient ID must not exceed 50 characters."),

  name: z
    .string()
    .trim()
    .min(2, "Patient name must be at least 2 characters long.")
    .max(150, "Patient name must not exceed 150 characters."),

  age: z
    .number()
    .int("Age must be a whole number.")
    .min(0, "Age cannot be negative.")
    .max(150, "Please provide a valid age."),

  dateOfBirth: z
    .string()
    .trim()
    .max(20, "Date of birth is invalid.")
    .optional(),

  gender: z.enum(["male", "female", "other"], {
    message: "Please select a valid gender.",
  }),

  phone: z
    .string()
    .trim()
    .max(30, "Phone number must not exceed 30 characters."),

  address: z
    .string()
    .trim()
    .max(500, "Address must not exceed 500 characters."),

  allergies: z
    .string()
    .trim()
    .max(1000, "Allergy information must not exceed 1000 characters."),

  notes: z
    .string()
    .trim()
    .max(2000, "Notes must not exceed 2000 characters."),
};

/**
 * Create patient validation.
 *
 * The frontend should send all patient fields required
 * for creating a patient.
 *
 * IMPORTANT:
 * userId is intentionally NOT accepted here.
 *
 * The backend determines the owner from the authenticated
 * user's access token.
 */
export const createPatientSchema = z.object({
  patientId: patientFields.patientId,
  name: patientFields.name,
  age: patientFields.age,
  dateOfBirth: patientFields.dateOfBirth,
  gender: patientFields.gender,
  phone: patientFields.phone,
  address: patientFields.address,
  allergies: patientFields.allergies,
  notes: patientFields.notes,
});

/**
 * Update patient validation.
 *
 * Every field is optional because PUT requests from the
 * frontend may update only some patient information.
 *
 * userId is still intentionally excluded.
 */
export const updatePatientSchema = z
  .object({
    patientId: patientFields.patientId.optional(),

    name: patientFields.name.optional(),

    age: patientFields.age.optional(),

    dateOfBirth: patientFields.dateOfBirth,

    gender: patientFields.gender.optional(),

    phone: patientFields.phone.optional(),

    address: patientFields.address.optional(),

    allergies: patientFields.allergies.optional(),

    notes: patientFields.notes.optional(),
  })
  .strict();

/**
 * TypeScript types inferred from the schemas.
 */
export type CreatePatientInput = z.infer<
  typeof createPatientSchema
>;

export type UpdatePatientInput = z.infer<
  typeof updatePatientSchema
>;