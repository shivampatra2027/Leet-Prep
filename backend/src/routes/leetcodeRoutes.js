import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { syncLeetCodeCalendar } from "../services/leetcodeCalendarSync.js";

const router = express.Router();

// THIS IS THE MISSING ROUTE
router.post("/sync-calendar", protect, async (req, res) => {
  try {
    if (!req.user.leetcodeUsername) {
      return res
        .status(400)
        .json({ error: "LeetCode username not set on your profile" });
    }

    console.log(
      `Starting sync for user ${req.user._id} with username ${req.user.leetcodeUsername}`,
    );

    await syncLeetCodeCalendar(req.user.leetcodeUsername, req.user._id);

    console.log(`Sync completed for user ${req.user._id}`);
    res.json({ ok: true, message: "LeetCode calendar synced successfully" });
  } catch (err) {
    console.error("Calendar sync error:", {
      userId: req.user?._id,
      username: req.user?.leetcodeUsername,
      error: err.message,
      stack: err.stack,
    });
    res.status(500).json({
      error: err.message || "Failed to sync LeetCode calendar",
      details: process.env.NODE_ENV === "development" ? err.stack : undefined,
    });
  }
});

export default router;
