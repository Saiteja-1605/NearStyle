import { Request, Response, NextFunction } from 'express';
import { Reservation } from '../models/Reservation';
import { Product } from '../models/Product';
import { Store } from '../models/Store';
import { Notification } from '../models/Notification';
import { generateReservationCode } from '../utils/codeGenerator';
import { checkAndExpireReservations } from '../utils/reservationExpiry';

// @desc Create a new 8-hour product reservation (Reserve & Try)
// @route POST /api/reservations
export const createReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    // Lazy cleanup of any expired reservations before allocating stock
    await checkAndExpireReservations();

    const { productId, size, colour } = req.body;

    if (!productId || !size || !colour) {
      res.status(400).json({ message: 'Product ID, size, and colour are required.' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    if (!product.isAvailable) {
      res.status(400).json({ message: 'This product is currently out of stock.' });
      return;
    }

    if (!product.reservationEligible) {
      res.status(400).json({ message: 'This product is not eligible for Reserve & Try.' });
      return;
    }

    const store = await Store.findById(product.storeId);
    if (!store || store.status !== 'APPROVED') {
      res.status(400).json({ message: 'The store is currently not taking reservations.' });
      return;
    }

    if (store.allowsReservation === false) {
      res.status(400).json({ message: 'This store has disabled the Reserve & Try feature.' });
      return;
    }

    const upperSize = size.toUpperCase();
    const sizeStock = product.sizes.find((s) => s.size === upperSize);
    if (!sizeStock) {
      res.status(400).json({ message: `Size ${upperSize} is not available for this product.` });
      return;
    }

    const availableStock = sizeStock.quantity - (sizeStock.reserved || 0);
    if (availableStock < 1) {
      res.status(400).json({
        message: `Sorry! Size ${upperSize} is currently fully reserved or out of stock.`,
      });
      return;
    }

    // Prevent duplicate active reservation for the exact same product and size by the same customer
    const existingActive = await Reservation.findOne({
      customerId: req.user.id,
      productId: product._id,
      size: upperSize,
      status: 'ACTIVE',
    });

    if (existingActive) {
      res.status(400).json({
        message: `You already have an active reservation for this item (${existingActive.reservationCode}). Visit the store or cancel your existing reservation.`,
      });
      return;
    }

    // Atomic inventory lock: increment reserved by 1
    const updatedProduct = await Product.findOneAndUpdate(
      {
        _id: product._id,
        'sizes.size': upperSize,
        // Ensure atomic condition check: available stock >= 1
        $expr: {
          $gte: [
            {
              $subtract: [
                {
                  $arrayElemAt: [
                    '$sizes.quantity',
                    { $indexOfArray: ['$sizes.size', upperSize] },
                  ],
                },
                {
                  $arrayElemAt: [
                    '$sizes.reserved',
                    { $indexOfArray: ['$sizes.size', upperSize] },
                  ],
                },
              ],
            },
            1,
          ],
        },
      },
      {
        $inc: { 'sizes.$.reserved': 1 },
      },
      { new: true }
    );

    if (!updatedProduct) {
      res.status(400).json({
        message: 'Unable to reserve: Stock was just claimed by another customer. Please try again.',
      });
      return;
    }

    // Calculate 8-hour expiry deadline
    const reservedAt = new Date();
    const expiresAt = new Date(reservedAt.getTime() + 8 * 60 * 60 * 1000); // 8 Hours
    const reservationCode = generateReservationCode();

    const reservation = await Reservation.create({
      reservationCode,
      customerId: req.user.id,
      storeId: product.storeId,
      productId: product._id,
      size: upperSize,
      colour,
      quantity: 1,
      reservedAt,
      expiresAt,
      status: 'ACTIVE',
    });

    // Notify customer
    try {
      await Notification.create({
        userId: req.user.id,
        title: 'Reservation Confirmed (8 Hours)',
        message: `You reserved "${product.name}" (Size ${upperSize}) at ${store.name}. Show code ${reservationCode} at the store!`,
        type: 'RESERVATION',
        link: '/reservations',
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    res.status(201).json({
      message: 'Reservation created successfully! Your item is held for 8 hours.',
      reservation: {
        ...reservation.toObject(),
        productName: product.name,
        storeName: store.name,
        storeAddress: store.address,
      },
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get customer's reservations
// @route GET /api/reservations/my
export const getMyReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await checkAndExpireReservations();

    const reservations = await Reservation.find({ customerId: req.user.id })
      .populate('productId')
      .populate('storeId')
      .sort({ createdAt: -1 })
      .lean();

    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

// @desc Customer cancels an active reservation
// @route POST /api/reservations/:id/cancel
export const cancelReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    await checkAndExpireReservations();

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      customerId: req.user.id,
    });

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    if (reservation.status !== 'ACTIVE') {
      res.status(400).json({
        message: `Cannot cancel reservation with status ${reservation.status}.`,
      });
      return;
    }

    // Release locked inventory: decrement reserved
    await Product.updateOne(
      {
        _id: reservation.productId,
        'sizes.size': reservation.size,
      },
      {
        $inc: { 'sizes.$.reserved': -reservation.quantity },
      }
    );

    // Safeguard non-negative
    await Product.updateOne(
      {
        _id: reservation.productId,
        'sizes.size': reservation.size,
        'sizes.reserved': { $lt: 0 },
      },
      {
        $set: { 'sizes.$.reserved': 0 },
      }
    );

    reservation.status = 'CANCELLED';
    reservation.cancelledAt = new Date();
    await reservation.save();

    res.json({
      message: 'Reservation cancelled successfully. Item released to store inventory.',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get reservations for shopkeeper's store
// @route GET /api/reservations/store
export const getStoreReservations = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    await checkAndExpireReservations();

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.json([]);
      return;
    }

    const { status } = req.query;
    const filter: any = { storeId: store._id };

    if (status && status !== 'ALL') {
      filter.status = status;
    }

    const reservations = await Reservation.find(filter)
      .populate('customerId', 'name email phone')
      .populate('productId')
      .sort({ createdAt: -1 })
      .lean();

    res.json(reservations);
  } catch (error) {
    next(error);
  }
};

// @desc Shopkeeper verifies reservation code
// @route POST /api/reservations/verify
export const verifyReservationCode = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    await checkAndExpireReservations();

    const { code } = req.body;
    if (!code) {
      res.status(400).json({ message: 'Reservation code is required.' });
      return;
    }

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.status(404).json({ message: 'Store not found.' });
      return;
    }

    const reservation = await Reservation.findOne({
      reservationCode: code.trim().toUpperCase(),
      storeId: store._id,
    })
      .populate('customerId', 'name email phone')
      .populate('productId')
      .lean();

    if (!reservation) {
      res.status(404).json({ message: `No reservation found for code "${code}" at your store.` });
      return;
    }

    res.json(reservation);
  } catch (error) {
    next(error);
  }
};

// @desc Shopkeeper marks customer physical purchase of reserved item
// @route POST /api/reservations/:id/purchase
export const markReservationPurchased = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    await checkAndExpireReservations();

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.status(404).json({ message: 'Store not found.' });
      return;
    }

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      storeId: store._id,
    });

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found at this store.' });
      return;
    }

    if (reservation.status !== 'ACTIVE') {
      res.status(400).json({
        message: `Cannot purchase item with reservation status: ${reservation.status}`,
      });
      return;
    }

    // Permanently decrement physical quantity AND decrement reserved count
    await Product.updateOne(
      {
        _id: reservation.productId,
        'sizes.size': reservation.size,
      },
      {
        $inc: {
          'sizes.$.quantity': -reservation.quantity,
          'sizes.$.reserved': -reservation.quantity,
        },
      }
    );

    // Safeguard
    await Product.updateOne(
      {
        _id: reservation.productId,
        'sizes.size': reservation.size,
        'sizes.reserved': { $lt: 0 },
      },
      {
        $set: { 'sizes.$.reserved': 0 },
      }
    );

    reservation.status = 'COMPLETED';
    reservation.completedAt = new Date();
    await reservation.save();

    // Notify customer
    try {
      await Notification.create({
        userId: reservation.customerId,
        title: 'Reserve & Try Purchase Complete!',
        message: `Thank you for trying and purchasing your reserved item in-store at ${store.name}!`,
        type: 'RESERVATION',
        link: '/reservations',
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    res.json({
      message: 'Reservation completed. Physical inventory updated successfully.',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Shopkeeper releases an active reservation manually
// @route POST /api/reservations/:id/release
export const releaseReservation = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    await checkAndExpireReservations();

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.status(404).json({ message: 'Store not found.' });
      return;
    }

    const reservation = await Reservation.findOne({
      _id: req.params.id,
      storeId: store._id,
    });

    if (!reservation) {
      res.status(404).json({ message: 'Reservation not found.' });
      return;
    }

    if (reservation.status !== 'ACTIVE') {
      res.status(400).json({
        message: `Cannot release reservation with status: ${reservation.status}`,
      });
      return;
    }

    // Release locked inventory
    await Product.updateOne(
      {
        _id: reservation.productId,
        'sizes.size': reservation.size,
      },
      {
        $inc: { 'sizes.$.reserved': -reservation.quantity },
      }
    );

    reservation.status = 'CANCELLED';
    reservation.cancelledAt = new Date();
    await reservation.save();

    res.json({
      message: 'Reservation released. Item restored to available stock.',
      reservation,
    });
  } catch (error) {
    next(error);
  }
};
