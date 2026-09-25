import { Router } from 'express';
import { getWishlist, toggleWishlist } from '../controllers/wishlistController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

router.use(authenticate);
router.use(requireRole(['CUSTOMER']));

router.get('/', getWishlist);
router.post('/toggle', toggleWishlist);

export default router;
