import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  getMyReferral,
  joinReferral,
  applyReferral,
  getLeaderboard,
  redeemPoints,
} from "../controllers/referralController.js";

const router = express.Router();

// Public — leaderboard visible without login
router.get("/leaderboard", getLeaderboard);

// Protected
router.get("/me", protect, getMyReferral);
router.post("/join", protect, joinReferral); // explicit opt-in
router.post("/apply", protect, applyReferral);
router.post("/redeem", protect, redeemPoints);

export default router;
