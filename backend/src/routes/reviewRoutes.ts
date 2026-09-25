import { Router } from 'express';
import { createReview, getProductReviews } from '../controllers/reviewController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.get('/product/:productId', getProductReviews);
router.post('/', authenticate, requireRole(['CUSTOMER']), createReview);

export default router;
