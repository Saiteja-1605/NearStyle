import { Router } from 'express';
import {
  getAdminMetrics,
  getAdminStores,
  updateStoreStatus,
  getAdminUsers,
  getAdminOrders,
} from '../controllers/adminController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.use(authenticate);
router.use(requireRole(['ADMIN']));

router.get('/metrics', getAdminMetrics);
router.get('/stores', getAdminStores);
router.patch('/stores/:id/status', updateStoreStatus);
router.get('/users', getAdminUsers);
router.get('/orders', getAdminOrders);

export default router;
