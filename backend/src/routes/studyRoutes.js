import express from "express";
import { protect } from "../middlewares/authMiddleware.js";
import {
  askStudyQuestion,
  deleteAllStudyMaterials,
  deleteStudyMaterial,
  generateStudyQuiz,
  listMaterials,
  summarizeStudyTopic,
  uploadMaterial,
  uploadStudyMaterial,
} from "../controllers/studyController.js";

const router = express.Router();

router.get("/materials", protect, listMaterials);
router.delete("/materials", protect, deleteAllStudyMaterials);
router.delete("/materials/:id", protect, deleteStudyMaterial);
router.post(
  "/upload",
  protect,
  uploadStudyMaterial.any(),
  uploadMaterial,
);
router.post("/ask", protect, askStudyQuestion);
router.post("/summarize", protect, summarizeStudyTopic);
router.post("/quiz", protect, generateStudyQuiz);

export default router;