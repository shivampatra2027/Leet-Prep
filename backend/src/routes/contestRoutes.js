import express from "express";
import { getContests } from "../utils/contestStore.js";

const router = express.Router();

router.get("/", (req, res) => {
  try {
    const contests = getContests();
    const now = Date.now();
    const oneWeekAgo = now - 7 * 24 * 60 * 60 * 1000; // 1 week ago
    const type = req.query.type || "upcoming"; // upcoming, live, or expired

    let filteredContests;

    if (type === "expired") {
      // Show expired contests from last 7 days only
      filteredContests = contests
        .filter((c) => c.endTime < now && c.endTime > oneWeekAgo)
        .sort((a, b) => b.endTime - a.endTime); // Most recent first
    } else if (type === "live") {
      // Contests currently running
      filteredContests = contests
        .filter((c) => c.startTime <= now && c.endTime > now)
        .sort((a, b) => a.endTime - b.endTime); // Ending soon first
    } else {
      // Show upcoming contests
      filteredContests = contests
        .filter((c) => c.startTime > now)
        .sort((a, b) => a.startTime - b.startTime);
    }

    res.json({
      success: true,
      count: filteredContests.length,
      contests: filteredContests,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Failed to fetch contests",
    });
  }
});

export default router;
