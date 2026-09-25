import { Router } from 'express';
import {
  getStores,
  getStoreById,
  getMyStore,
  updateMyStore,
} from '../controllers/storeController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// Public store discovery
router.get('/', getStores);

// Shopkeeper store management (must come before /:id)
router.get('/my-store', authenticate, requireRole(['SHOPKEEPER']), getMyStore);
router.put('/my-store', authenticate, requireRole(['SHOPKEEPER']), updateMyStore);

// Specific store details + its catalog
router.get('/:id', getStoreById);

export default router;
