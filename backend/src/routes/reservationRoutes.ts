import { Router } from 'express';
import {
  createReservation,
  getMyReservations,
  cancelReservation,
  getStoreReservations,
  verifyReservationCode,
  markReservationPurchased,
  releaseReservation,
} from '../controllers/reservationController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.use(authenticate);

// Customer endpoints
router.post('/', requireRole(['CUSTOMER']), createReservation);
router.get('/my', requireRole(['CUSTOMER']), getMyReservations);
router.post('/:id/cancel', requireRole(['CUSTOMER']), cancelReservation);

// Shopkeeper endpoints
router.get('/store', requireRole(['SHOPKEEPER']), getStoreReservations);
router.post('/verify', requireRole(['SHOPKEEPER']), verifyReservationCode);
router.post('/:id/purchase', requireRole(['SHOPKEEPER']), markReservationPurchased);
router.post('/:id/release', requireRole(['SHOPKEEPER']), releaseReservation);

export default router;
