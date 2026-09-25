import { Router } from 'express';
import {
  updateSizeStock,
  toggleAvailability,
  getLowStockProducts,
} from '../controllers/inventoryController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.use(authenticate);
router.use(requireRole(['SHOPKEEPER']));

router.get('/low-stock', getLowStockProducts);
router.patch('/:productId/size', updateSizeStock);
router.patch('/:productId/toggle-availability', toggleAvailability);

export default router;
