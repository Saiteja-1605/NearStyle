import { Router } from 'express';
import {
  getProducts,
  getProductById,
  createProduct,
  updateProduct,
  deleteProduct,
  getMyProducts,
} from '../controllers/productController';
import { authenticate } from '../middleware/auth';
import { requireRole } from '../middleware/role';

const router = Router();

// Public catalog and search
router.get('/', getProducts);

// Shopkeeper product list
router.get('/shopkeeper/my-products', authenticate, requireRole(['SHOPKEEPER']), getMyProducts);

// Single product details
router.get('/:id', getProductById);

// Shopkeeper mutations
router.post('/', authenticate, requireRole(['SHOPKEEPER']), createProduct);
router.put('/:id', authenticate, requireRole(['SHOPKEEPER']), updateProduct);
router.delete('/:id', authenticate, requireRole(['SHOPKEEPER']), deleteProduct);

export default router;
