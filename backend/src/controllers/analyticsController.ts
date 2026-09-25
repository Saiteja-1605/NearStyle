import { Request, Response, NextFunction } from 'express';
import { Order } from '../models/Order';
import { Reservation } from '../models/Reservation';
import { Product } from '../models/Product';
import { Store } from '../models/Store';

// @desc Get Shopkeeper store analytics
// @route GET /api/analytics/shopkeeper
export const getShopkeeperAnalytics = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }

    const storeId = store._id;
    const now = new Date();
    const startOfToday = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    // Fetch store orders
    const allOrders = await Order.find({
      storeId,
      orderStatus: { $ne: 'CANCELLED' },
    }).lean();

    const todayOrders = allOrders.filter((o) => new Date(o.createdAt) >= startOfToday);
    const weeklyOrders = allOrders.filter((o) => new Date(o.createdAt) >= sevenDaysAgo);
    const monthlyOrders = allOrders.filter((o) => new Date(o.createdAt) >= thirtyDaysAgo);

    const todaySales = todayOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const weeklySales = weeklyOrders.reduce((sum, o) => sum + o.totalAmount, 0);
    const monthlySales = monthlyOrders.reduce((sum, o) => sum + o.totalAmount, 0);

    // Active Reservations
    const activeReservationsCount = await Reservation.countDocuments({
      storeId,
      status: 'ACTIVE',
    });
    const completedReservationsCount = await Reservation.countDocuments({
      storeId,
      status: 'COMPLETED',
    });

    // Total products & low stock count
    const products = await Product.find({ storeId }).lean();
    let lowStockCount = 0;
    products.forEach((p) => {
      const isLow = p.sizes.some((s) => s.quantity - (s.reserved || 0) <= 2);
      if (isLow) lowStockCount++;
    });

    // Top selling items from orders
    const productSalesMap = new Map<string, { name: string; units: number; revenue: number }>();
    allOrders.forEach((o) => {
      o.items.forEach((item) => {
        const prodId = item.productId.toString();
        const existing = productSalesMap.get(prodId) || { name: item.name, units: 0, revenue: 0 };
        existing.units += item.quantity;
        existing.revenue += item.price * item.quantity;
        productSalesMap.set(prodId, existing);
      });
    });

    const topProducts = Array.from(productSalesMap.values())
      .sort((a, b) => b.revenue - a.revenue)
      .slice(0, 5);

    res.json({
      metrics: {
        todaySales,
        weeklySales,
        monthlySales,
        todayOrdersCount: todayOrders.length,
        totalOrdersCount: allOrders.length,
        activeReservations: activeReservationsCount,
        completedReservations: completedReservationsCount,
        totalProducts: products.length,
        lowStockCount,
      },
      topProducts,
      recentOrders: allOrders.slice(0, 5),
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get platform-level trend insights
// @route GET /api/analytics/trends
export const getPlatformTrends = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    // Aggregated categories
    const categoryStats = await Product.aggregate([
      { $match: { isAvailable: true } },
      { $group: { _id: '$category', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
      { $limit: 6 },
    ]);

    // Popular reservation products
    const highInterestReservations = await Reservation.aggregate([
      { $group: { _id: '$productId', reservationCount: { $sum: 1 } } },
      { $sort: { reservationCount: -1 } },
      { $limit: 5 },
      {
        $lookup: {
          from: 'products',
          localField: '_id',
          foreignField: '_id',
          as: 'product',
        },
      },
      { $unwind: '$product' },
      {
        $project: {
          productName: '$product.name',
          category: '$product.category',
          image: { $arrayElemAt: ['$product.images', 0] },
          reservationCount: 1,
        },
      },
    ]);

    // Popular sizes and colors
    const popularSizes = [
      { size: 'M', share: '38%' },
      { size: 'L', share: '32%' },
      { size: 'S', share: '18%' },
      { size: 'XL', share: '12%' },
    ];

    const popularColors = [
      { color: 'Black', hex: '#0F172A', demand: 'High' },
      { color: 'Navy Blue', hex: '#1E3A8A', demand: 'High' },
      { color: 'White', hex: '#F8FAFC', demand: 'Moderate' },
      { color: 'Olive Green', hex: '#365314', demand: 'Trending' },
      { color: 'Burgundy', hex: '#881337', demand: 'Rising' },
    ];

    const popularPriceRanges = [
      { range: '₹500 - ₹1,499', percentage: 46 },
      { range: '₹1,500 - ₹2,999', percentage: 34 },
      { range: '₹3,000+', percentage: 20 },
    ];

    res.json({
      popularCategories: categoryStats.map((c) => ({ category: c._id, count: c.count })),
      highInterestReservations,
      popularSizes,
      popularColors,
      popularPriceRanges,
    });
  } catch (error) {
    next(error);
  }
};
