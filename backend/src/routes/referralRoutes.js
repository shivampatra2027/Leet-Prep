import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import { strictLimiter } from "../middlewares/rateLimiters.js";
import {
  getMyReferral,
  joinReferral,
  applyReferral,
  getLeaderboard,
  redeemPoints,
} from "../controllers/referralController.js";

const router = express.Router();

// public
router.get("/leaderboard", (req, res, next) => {
  res.set("Cache-Control", "public, max-age=60");
  next();
}, getLeaderboard);

// protected
router.get("/me", protect, getMyReferral);
router.post("/join", protect, joinReferral);
router.post("/apply", protect, strictLimiter, applyReferral);
router.post("/redeem", protect, strictLimiter, redeemPoints);

export default router;
