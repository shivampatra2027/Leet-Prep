import express from "express";
import { getAllProblems,getCompanies,getProblemById} from "../controllers/problemController.js";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();


router.get("/",protect, getAllProblems);
router.get("/:id",protect, getProblemById);
router.get("/companies/:companyId", protect, getProblemById);
router.get("/companies", protect, getCompanies);
export default router;
