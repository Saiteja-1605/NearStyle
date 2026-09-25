import { Router } from 'express';
import {
  registerCustomer,
  loginCustomer,
  registerShopkeeper,
  loginShopkeeper,
  loginAdmin,
  getCurrentUser,
  updateProfile,
} from '../controllers/authController';
import { authenticate } from '../middleware/auth';

const router = Router();

// Customer
router.post('/customer/register', registerCustomer);
router.post('/customer/login', loginCustomer);

// Shopkeeper
router.post('/shopkeeper/register', registerShopkeeper);
router.post('/shopkeeper/login', loginShopkeeper);

// Admin
router.post('/admin/login', loginAdmin);

// Profile
router.get('/me', authenticate, getCurrentUser);
router.put('/profile', authenticate, updateProfile);

export default router;
