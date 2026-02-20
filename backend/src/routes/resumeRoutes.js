import express from "express";
import { analyzeResume, uploadResume } from "../controllers/resumeController.js";
import { protect } from "../middlewares/authMiddleware.js";
import { aiQuotaGuard } from "../middlewares/aiQuotaGuard.js";

const router = express.Router();

router.post("/analyze", protect, aiQuotaGuard(), uploadResume.single("resume"), analyzeResume);

export default router;


