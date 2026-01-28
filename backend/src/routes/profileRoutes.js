import express from 'express';
import { 
  getUserProfile, 
  updateLeetcodeUsername, 
  syncLeetcodeProblems,
  getSolvedProblems 
} from '../controllers/profileController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.get('/', protect, getUserProfile);
router.put('/leetcode-username', protect, updateLeetcodeUsername);
router.post('/sync-leetcode', protect, syncLeetcodeProblems);
router.get('/solved-problems', protect, getSolvedProblems);

export default router;
