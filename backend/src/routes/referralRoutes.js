import express from "express";
import rateLimit from "express-rate-limit";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyReferral,
  joinReferral,
  applyReferral,
  getLeaderboard,
  redeemPoints,
} from "../controllers/referralController.js";

const router = express.Router();

const applyLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 5 });
const joinLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 3 });
const redeemLimiter = rateLimit({ windowMs: 60 * 60 * 1000, max: 10 });

// public
router.get("/leaderboard", (req, res, next) => {
  res.set("Cache-Control", "public, max-age=60");
  next();
}, getLeaderboard);

// protected
router.get("/me", protect, getMyReferral);
router.post("/join", protect, joinLimiter, joinReferral);
router.post("/apply", protect, applyLimiter, applyReferral);
router.post("/redeem", protect, redeemLimiter, redeemPoints);

export default router;
