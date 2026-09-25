import { Router } from 'express';
import {
  createOrder,
  getMyOrders,
  getOrderById,
  getStoreOrders,
  updateOrderStatus,
  requestReturn,
  updateReturnStatus,
} from '../controllers/orderController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.use(authenticate);

// Customer
router.post('/', requireRole(['CUSTOMER']), createOrder);
router.get('/my', requireRole(['CUSTOMER']), getMyOrders);
router.post('/:id/return', requireRole(['CUSTOMER']), requestReturn);

// Shopkeeper
router.get('/store', requireRole(['SHOPKEEPER']), getStoreOrders);
router.put('/:id/status', requireRole(['SHOPKEEPER']), updateOrderStatus);
router.put('/:id/return-status', requireRole(['SHOPKEEPER', 'ADMIN']), updateReturnStatus);

// Shared / Details
router.get('/:id', getOrderById);

export default router;
