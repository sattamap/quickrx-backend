import express from "express";
import cors from "cors";
import patientRoutes from "./routes/patientRoutes";
import errorMiddleware from "./middleware/errorMiddleware";

const app = express();

app.use(cors());
app.use(express.json());

app.get("/api/health", (_req, res) => {
  res.status(200).json({
    success: true,
    message: "QuickRx API is running",
  });
});

app.use("/api/patients", patientRoutes);

app.use(errorMiddleware);

export default app;