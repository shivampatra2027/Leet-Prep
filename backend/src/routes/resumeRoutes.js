import express from "express";
import { analyzeResume, uploadResume } from "../controllers/resumeController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.post("/analyze", protect, uploadResume.single("resume"), analyzeResume);

export default router;
