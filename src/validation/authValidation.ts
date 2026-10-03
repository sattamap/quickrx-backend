import { z } from "zod";

/**
 * Registration validation.
 *
 * The public registration endpoint intentionally does not
 * accept a role. New public accounts are doctors.
 */
export const registerSchema = z.object({
  name: z
    .string()
    .trim()
    .min(2, "Name must be at least 2 characters long.")
    .max(100, "Name must not exceed 100 characters."),

  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(254, "Email address is too long."),

  password: z
    .string()
    .min(8, "Password must be at least 8 characters long.")
    .max(128, "Password must not exceed 128 characters."),
});

/**
 * Login validation.
 */
export const loginSchema = z.object({
  email: z
    .string()
    .trim()
    .email("Please provide a valid email address.")
    .max(254, "Email address is too long."),

  password: z
    .string()
    .min(1, "Password is required.")
    .max(128, "Password must not exceed 128 characters."),
});

/**
 * TypeScript types inferred directly from the schemas.
 */
export type RegisterInput = z.infer<
  typeof registerSchema
>;

export type LoginInput = z.infer<
  typeof loginSchema
>;