import { Request, Response, NextFunction } from 'express';
import { Order, IOrderItem } from '../models/Order';
import { Product } from '../models/Product';
import { Store } from '../models/Store';
import { Notification } from '../models/Notification';
import { generateOrderNumber } from '../utils/codeGenerator';

// @desc Create new order (Home Delivery or Store Pickup)
// @route POST /api/orders
export const createOrder = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { items, shippingAddress, orderType, paymentMethod } = req.body;

    if (!items || !Array.isArray(items) || items.length === 0) {
      res.status(400).json({ message: 'Order must contain at least one item.' });
      return;
    }

    if (!shippingAddress || !shippingAddress.fullName || !shippingAddress.phone || !shippingAddress.city) {
      res.status(400).json({ message: 'Valid contact and address details are required.' });
      return;
    }

    // Verify all items and deduce storeId (if items are from single store)
    let storeId: any = null;
    let subtotal = 0;
    const orderItems: IOrderItem[] = [];

    for (const item of items) {
      const product = await Product.findById(item.productId);
      if (!product || !product.isAvailable) {
        res.status(400).json({ message: `Product "${item.name}" is no longer available.` });
        return;
      }

      if (!storeId) {
        storeId = product.storeId;
      }

      const sizeStock = product.sizes.find((s) => s.size === item.size.toUpperCase());
      if (!sizeStock) {
        res.status(400).json({ message: `Size ${item.size} is unavailable for ${product.name}.` });
        return;
      }

      const available = sizeStock.quantity - (sizeStock.reserved || 0);
      if (available < item.quantity) {
        res.status(400).json({
          message: `Only ${available} unit(s) available for ${product.name} (Size ${item.size}).`,
        });
        return;
      }

      const itemPrice = product.discountPrice || product.price;
      subtotal += itemPrice * item.quantity;

      orderItems.push({
        productId: product._id as any,
        name: product.name,
        image: product.images[0] || '',
        size: item.size.toUpperCase(),
        colour: item.colour || 'Standard',
        price: itemPrice,
        quantity: item.quantity,
      });

      // Deduct inventory
      sizeStock.quantity = Math.max(0, sizeStock.quantity - item.quantity);
      await product.save();
    }

    const deliveryFee = orderType === 'STORE_PICKUP' || subtotal >= 999 ? 0 : 49;
    const totalAmount = subtotal + deliveryFee;
    const orderNumber = generateOrderNumber();

    const order = await Order.create({
      orderNumber,
      customerId: req.user.id,
      storeId,
      items: orderItems,
      subtotal,
      deliveryFee,
      totalAmount,
      shippingAddress,
      orderType: orderType || 'HOME_DELIVERY',
      paymentMethod: paymentMethod || 'DEMO_PAYMENT',
      paymentStatus: paymentMethod === 'COD' ? 'PENDING' : 'PAID',
      orderStatus: 'PLACED',
    });

    // Notify customer
    try {
      await Notification.create({
        userId: req.user.id,
        title: 'Order Placed Successfully',
        message: `Your order #${orderNumber} for ₹${totalAmount} has been confirmed!`,
        type: 'ORDER',
        link: `/orders/${order._id}`,
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    res.status(201).json({
      message: 'Order placed successfully',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get customer's orders
// @route GET /api/orders/my
export const getMyOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const orders = await Order.find({ customerId: req.user.id })
      .populate('storeId', 'name address phone city area')
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc Get single order details
// @route GET /api/orders/:id
export const getOrderById = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const order = await Order.findById(req.params.id)
      .populate('storeId', 'name address phone city area image')
      .populate('customerId', 'name email phone')
      .lean();

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    // Role check: Only customer who made it, shopkeeper who owns store, or admin
    if (
      req.user &&
      req.user.role === 'CUSTOMER' &&
      order.customerId?._id?.toString() !== req.user.id
    ) {
      res.status(403).json({ message: 'Unauthorized access to this order.' });
      return;
    }

    res.json(order);
  } catch (error) {
    next(error);
  }
};

// @desc Get shopkeeper's store orders
// @route GET /api/orders/store
export const getStoreOrders = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.json([]);
      return;
    }

    const { status } = req.query;
    const filter: any = { storeId: store._id };

    if (status && status !== 'ALL') {
      filter.orderStatus = status;
    }

    const orders = await Order.find(filter)
      .populate('customerId', 'name email phone')
      .sort({ createdAt: -1 })
      .lean();

    res.json(orders);
  } catch (error) {
    next(error);
  }
};

// @desc Shopkeeper updates order status
// @route PUT /api/orders/:id/status
export const updateOrderStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const { status } = req.body;
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    const validStatuses = [
      'PLACED',
      'CONFIRMED',
      'PREPARING',
      'READY',
      'OUT_FOR_DELIVERY',
      'DELIVERED',
      'CANCELLED',
    ];

    if (!validStatuses.includes(status)) {
      res.status(400).json({ message: `Invalid status: ${status}` });
      return;
    }

    order.orderStatus = status;
    if (status === 'DELIVERED') {
      order.paymentStatus = 'PAID';
    }
    await order.save();

    // Notify customer of status change
    try {
      await Notification.create({
        userId: order.customerId,
        title: `Order Status: ${status}`,
        message: `Your order #${order.orderNumber} has been updated to "${status}".`,
        type: 'ORDER',
        link: `/orders/${order._id}`,
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    res.json({
      message: `Order status updated to ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Customer requests return
// @route POST /api/orders/:id/return
export const requestReturn = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { reason, notes } = req.body;
    if (!reason) {
      res.status(400).json({ message: 'Please select a reason for the return.' });
      return;
    }

    const order = await Order.findOne({ _id: req.params.id, customerId: req.user.id });
    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (order.orderStatus !== 'DELIVERED') {
      res.status(400).json({ message: 'Only delivered orders are eligible for return.' });
      return;
    }

    order.orderStatus = 'RETURN_REQUESTED';
    order.returnDetails = {
      reason,
      requestedAt: new Date(),
      status: 'REQUESTED',
      notes: notes || '',
    };

    await order.save();

    res.json({
      message: 'Return request submitted successfully. The store will review your request.',
      order,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Shopkeeper / Admin processes return request
// @route PUT /api/orders/:id/return-status
export const updateReturnStatus = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { status } = req.body; // 'APPROVED' | 'REJECTED' | 'RETURNED'
    const order = await Order.findById(req.params.id);

    if (!order) {
      res.status(404).json({ message: 'Order not found' });
      return;
    }

    if (!order.returnDetails) {
      res.status(400).json({ message: 'No return request recorded on this order.' });
      return;
    }

    order.returnDetails.status = status;
    if (status === 'RETURNED') {
      order.orderStatus = 'RETURNED';
    }

    await order.save();

    try {
      await Notification.create({
        userId: order.customerId,
        title: `Return Request ${status}`,
        message: `Your return request for order #${order.orderNumber} has been ${status}.`,
        type: 'RETURN',
        link: `/orders/${order._id}`,
      });
    } catch (notifErr) {
      console.warn('Notification error:', notifErr);
    }

    res.json({
      message: `Return request ${status}`,
      order,
    });
  } catch (error) {
    next(error);
  }
};
