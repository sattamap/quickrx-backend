import type { NextFunction, Request, Response } from "express";

const errorMiddleware = (
  error: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  console.error("API Error:", error);

  if (error instanceof Error) {
    res.status(500).json({
      success: false,
      message: error.message,
    });

    return;
  }

  res.status(500).json({
    success: false,
    message: "An unexpected error occurred.",
  });
};

export default errorMiddleware;