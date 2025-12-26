import express from 'express';
import { checkDashboardAccess } from '../controllers/premiumController.js';
import { protect } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Route to check user tier and get appropriate dashboard path
router.get('/check-dashboard', protect, checkDashboardAccess);

export default router;
