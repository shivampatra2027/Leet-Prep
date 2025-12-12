import express from "express";
import { getAllProblems } from "../controllers/problemController.js";

const router = express.Router();

router.get("/", getAllProblems);

export default router;
