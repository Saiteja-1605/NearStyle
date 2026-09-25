import { Router } from 'express';
import {
  getShopkeeperAnalytics,
  getPlatformTrends,
} from '../controllers/analyticsController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// Public / platform-level trends
router.get('/trends', getPlatformTrends);

// Shopkeeper-specific store analytics
router.get(
  '/shopkeeper',
  authenticate,
  requireRole(['SHOPKEEPER']),
  getShopkeeperAnalytics
);

export default router;
