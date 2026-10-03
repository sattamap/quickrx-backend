import type {
  NextFunction,
  Request,
  Response,
} from "express";

import type { ZodType } from "zod";

/**
 * Validate req.body using a Zod schema.
 */
export const validateBody =
  (schema: ZodType) =>
  (req: Request, res: Response, next: NextFunction): void => {
    const result = schema.safeParse(req.body);

    if (!result.success) {
      const errors = result.error.issues.map(
        (issue) => ({
          field: issue.path.join("."),
          message: issue.message,
        }),
      );

      res.status(400).json({
        success: false,
        message: "Validation failed.",
        errors,
      });

      return;
    }

    /**
     * Store the validated/transformed data back into
     * req.body.
     *
     * This is useful because our schemas use .trim().
     */
    req.body = result.data;

    next();
  };