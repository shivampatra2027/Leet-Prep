import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { syncLeetCodeCalendar } from "../services/leetcodeCalendarSync.js";

const router = express.Router();

// 🔥 THIS IS THE MISSING ROUTE
router.post("/sync-calendar", protect, async (req, res) => {
    try {
        if (!req.user.leetcodeUsername) {
            return res.status(400).json({ error: "LeetCode username not set" });
        }

        await syncLeetCodeCalendar(
            req.user.leetcodeUsername,
            req.user._id
        );

        res.json({ ok: true, message: "LeetCode calendar synced" });
    } catch (err) {
        console.error("Calendar sync error:", err);
        res.status(500).json({ error: err.message });
    }
});

export default router;
