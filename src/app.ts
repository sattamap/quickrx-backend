import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";

import authRoutes from "./routes/authRoutes";
import adminRoutes from "./routes/adminRoutes";
import patientRoutes from "./routes/patientRoutes";
import visitRoutes from "./routes/visitRoutes";
import prescriptionRoutes from "./routes/prescriptionRoutes";
import doctorProfileRoutes from "./routes/doctorProfileRoutes";
import prescriptionSettingsRoutes from "./routes/prescriptionSettingsRoutes";
import investigationRoutes from "./routes/investigationRoutes";
import bookingRoutes from "./routes/bookingRoutes";
import syncAgentRoutes from "./routes/syncAgentRoutes";

import { authMiddleware } from "./middleware/authMiddleware";
import errorMiddleware from "./middleware/errorMiddleware";

const app = express();

/**
 * HTTP security headers.
 *
 * Helmet adds several security-related response headers
 * such as:
 * - X-Content-Type-Options
 * - X-Frame-Options
 * - Referrer-Policy
 * - Content-Security-Policy
 * - Strict-Transport-Security (when appropriate)
 *
 * These help reduce common browser-based attacks.
 */
app.use(helmet());

/**
 * CORS
 *
 * Only the configured frontend origin is allowed.
 * Credentials are required because QuickRx uses
 * HttpOnly refresh-token cookies.
 */

/**
 * CORS
 *
 * Allow requests from the configured frontend origin.
 * Credentials are required for refresh-token cookies.
 */
const frontendOrigin = process.env.FRONTEND_ORIGIN;

if (!frontendOrigin) {
  throw new Error("FRONTEND_ORIGIN environment variable is not configured.");
}

app.use(
  cors({
    origin: frontendOrigin,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization", "X-CSRF-Token"],
  }),
);

/**
 * Parse JSON request bodies.
 *
 * The body-size limit will be tightened in the next
 * security step.
 */
app.use(
  express.json({
    limit: "100kb",
  }),
);

/**
 * Parse cookies.
 */
app.use(cookieParser());

/**
 * Health check.
 */
app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "QuickRx API is running",
  });
});

/**
 * Public authentication routes.
 */
app.use("/api/auth", authRoutes);
/**
 * Administrator-only routes.
 */
app.use("/api/admin", adminRoutes);

/**
 * Protected application routes.
 */
app.use("/api/patients", authMiddleware, patientRoutes);

app.use("/api/visits", authMiddleware, visitRoutes);

app.use("/api/prescriptions", authMiddleware, prescriptionRoutes);

app.use("/api/doctor-profile", authMiddleware, doctorProfileRoutes);

app.use(
  "/api/prescription-settings",
  authMiddleware,
  prescriptionSettingsRoutes,
);
app.use("/api/investigations", authMiddleware, investigationRoutes);
app.use("/api/bookings", bookingRoutes);
app.use("/api/sync-agent", syncAgentRoutes);

/**
 * Global error handler.
 *
 * Keep this after all routes.
 */
app.use(errorMiddleware);

export default app;
