import express from 'express';
import { getUserProfile } from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserProfile);

export default router;
