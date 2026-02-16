import express from "express";
import { getLeetCodeHeatmap } from "../controllers/analyticsController.js";
import { protect } from "../middlewares/authMiddleware.js";
import DailyActivity from "../models/DailyActivity.js";

const router = express.Router();

router.get("/leetcode-heatmap", protect, getLeetCodeHeatmap);

export default router;
