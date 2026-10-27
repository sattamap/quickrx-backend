
import type { NextFunction, Request, Response } from "express";
import crypto from "node:crypto";

const syncAgentAuth = (
  req: Request,
  res: Response,
  next: NextFunction,
): void => {
  const configuredSecret = process.env.SYNC_AGENT_SECRET;
  const providedSecret = req.header("x-sync-agent-secret");

  if (!configuredSecret || !providedSecret) {
    res.status(401).json({
      success: false,
      message: "Synchronization agent authentication required.",
    });
    return;
  }

  const expected = Buffer.from(configuredSecret, "utf8");
  const received = Buffer.from(providedSecret, "utf8");

  if (
    expected.length !== received.length ||
    !crypto.timingSafeEqual(expected, received)
  ) {
    res.status(401).json({
      success: false,
      message: "Invalid synchronization agent credentials.",
    });
    return;
  }

  next();
};

export default syncAgentAuth;
