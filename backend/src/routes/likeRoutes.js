import express from "express";
import { likeSite, getLikes } from "../controllers/LikeController.js";
import { protect } from "../middlewares/authMiddleware.js"; 
const router = express.Router();

router.post("/", likeSite);        
router.get("/", getLikes);        

export default router;