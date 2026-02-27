import express from "express";
import {
  getUserProfile,
  getSolvedProblems,
  addSolvedProblem,
  removeSolvedProblem,
  getSolvedSummary,
} from "../controllers/profileController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();

router.get("/", protect, getUserProfile);
router.get("/solved-problems", protect, getSolvedProblems);
router.post("/solved-problems", protect, addSolvedProblem);
router.delete("/solved-problems/:problemId", protect, removeSolvedProblem);
router.get("/solved-summary", protect, getSolvedSummary);

export default router;
