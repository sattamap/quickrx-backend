import { Router } from "express";
import rateLimit from "express-rate-limit";
import syncAgentAuth from "../middleware/syncAgentAuth";
import {
  checkSyncAgentAuth,
  claimSyncJob,
  completeSyncJob,
  failSyncJob,
} from "../controllers/syncAgentController";

const router = Router();

const syncAgentLimiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  limit: 60,
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many synchronization requests. Please try again later.",
  },
});

router.use(syncAgentLimiter);

router.use(syncAgentAuth);
router.get("/health", checkSyncAgentAuth);
router.post("/claim", claimSyncJob);
router.post("/:id/success", completeSyncJob);
router.post("/:id/failure", failSyncJob);

export default router;
