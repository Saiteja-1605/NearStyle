import { Request, Response, NextFunction } from 'express';
import { User } from '../models/User';
import { Store } from '../models/Store';
import { Product } from '../models/Product';
import { Order } from '../models/Order';
import { Reservation } from '../models/Reservation';

// @desc Get platform admin statistics
// @route GET /api/admin/metrics
export const getAdminMetrics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const totalCustomers = await User.countDocuments({ role: 'CUSTOMER' });
    const totalShopkeepers = await User.countDocuments({ role: 'SHOPKEEPER' });
    const totalStores = await Store.countDocuments();
    const pendingStores = await Store.countDocuments({ status: 'PENDING' });
    const approvedStores = await Store.countDocuments({ status: 'APPROVED' });
    const totalProducts = await Product.countDocuments();
    const totalOrders = await Order.countDocuments();
    const totalReservations = await Reservation.countDocuments();
    const activeReservations = await Reservation.countDocuments({ status: 'ACTIVE' });

    // Revenue calculation
    const revenueData = await Order.aggregate([
      { $match: { orderStatus: { $nin: ['CANCELLED', 'RETURNED'] } } },
      { $group: { _id: null, totalRevenue: { $sum: '$totalAmount' } } },
    ]);
    const grossRevenue = revenueData[0]?.totalRevenue || 0;

    res.json({
      totalCustomers,
      totalShopkeepers,
      totalStores,
      pendingStores,
      approvedStores,
      totalProducts,
      totalOrders,
      totalReservations,
      activeReservations,
      grossRevenue,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all stores for admin moderation
// @route GET /api/admin/stores
export const getAdminStores = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.query;
    const filter: any = {};
    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const stores = await Store.find(filter)
      .populate('ownerId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(stores);
  } catch (error) {
    next(error);
  }
};

// @desc Update store status (Approve, Reject, Suspend)
// @route PATCH /api/admin/stores/:id/status
export const updateStoreStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body;
    const validStatuses = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status: ${status}` });
      return;
    }

    const store = await Store.findById(req.params.id);
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }

    store.status = status;
    await store.save();

    res.json({
      message: `Store has been marked as ${status}`,
      store,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get all registered users for admin
// @route GET /api/admin/users
export const getAdminUsers = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { role } = req.query;
    const filter: any = {};
    if (role && role !== 'ALL') {
      filter.role = role;
    }

    const users = await User.find(filter).select('-password').sort({ createdAt: -1 }).lean();
    res.json(users);
  } catch (error) {
    next(error);
  }
};

// @desc Get all platform orders for admin
// @route GET /api/admin/orders
export const getAdminOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const orders = await Order.find()
      .populate('storeId', 'name city area')
      .populate('customerId', 'name email')
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.json(orders);
  } catch (error) {
    next(error);
  }
};
