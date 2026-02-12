import express from "express";
import { getLeetCodeHeatmap } from "../controllers/analyticsController.js";
import { protect } from "../middlewares/authMiddleware.js";
import DailyActivity from "../models/DailyActivity.js"; // ✅ MISSING IMPORT

const router = express.Router();

router.get("/leetcode-heatmap", protect, getLeetCodeHeatmap);

router.get("/leetcode-heatmap-test", async (req, res) => {
    try {
        const data = await DailyActivity.find({ platform: "leetcode" })
            .limit(10);
        res.json(data);
    } catch (err) {
        res.status(500).json({ error: err.message });
    }
});

export default router;
