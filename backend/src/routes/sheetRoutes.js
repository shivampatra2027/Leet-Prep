import express from "express";
import { getSheetBySlug } from "../controllers/sheetController.js";

const router = express.Router();

router.get("/:slug", getSheetBySlug);

export default router;

