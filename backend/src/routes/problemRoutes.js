import express from "express";
import { getAllProblems,getCompanies,getProblemById} from "../controllers/problemController.js";

const router = express.Router();


router.get("/", getAllProblems);
router.get("/:id", getProblemById);
router.get("/companies", getCompanies);

export default router;
