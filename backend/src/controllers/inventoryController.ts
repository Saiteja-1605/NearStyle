import { Request, Response, NextFunction } from 'express';
import { Product } from '../models/Product';
import { Store } from '../models/Store';

// @desc Quick update stock for a specific size
// @route PATCH /api/inventory/:productId/size
export const updateSizeStock = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const { productId } = req.params;
    const { size, quantity, delta } = req.body;

    if (!size) {
      res.status(400).json({ message: 'Size must be specified.' });
      return;
    }

    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }

    const product = await Product.findOne({ _id: productId, storeId: store._id });
    if (!product) {
      res.status(404).json({ message: 'Product not found or unauthorized.' });
      return;
    }

    const sizeItem = product.sizes.find((s) => s.size.toUpperCase() === size.toUpperCase());
    if (!sizeItem) {
      res.status(404).json({ message: `Size ${size} does not exist on this product.` });
      return;
    }

    if (delta !== undefined) {
      const newQty = sizeItem.quantity + Number(delta);
      if (newQty < (sizeItem.reserved || 0)) {
        res.status(400).json({
          message: `Cannot decrease stock below reserved units (${sizeItem.reserved || 0} currently reserved).`,
        });
        return;
      }
      sizeItem.quantity = Math.max(0, newQty);
    } else if (quantity !== undefined) {
      const newQty = Number(quantity);
      if (newQty < (sizeItem.reserved || 0)) {
        res.status(400).json({
          message: `Stock cannot be lower than active reservations (${sizeItem.reserved || 0} currently reserved).`,
        });
        return;
      }
      sizeItem.quantity = Math.max(0, newQty);
    }

    await product.save();

    res.json({
      message: 'Stock updated successfully',
      sizes: product.sizes,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Quick toggle product availability (Out of Stock / Available)
// @route PATCH /api/inventory/:productId/toggle-availability
export const toggleAvailability = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user || req.user.role !== 'SHOPKEEPER') {
      res.status(403).json({ message: 'Unauthorized' });
      return;
    }

    const { productId } = req.params;
    const store = await Store.findOne({ ownerId: req.user.id });
    if (!store) {
      res.status(404).json({ message: 'Store not found' });
      return;
    }

    const product = await Product.findOne({ _id: productId, storeId: store._id });
    if (!product) {
      res.status(404).json({ message: 'Product not found or unauthorized.' });
      return;
    }

    product.isAvailable = !product.isAvailable;
    await product.save();

    res.json({
      message: `Product marked as ${product.isAvailable ? 'Available' : 'Out of Stock'}`,
      isAvailable: product.isAvailable,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get low stock items (quantity - reserved <= 2)
// @route GET /api/inventory/low-stock
export const getLowStockProducts = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
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

    const products = await Product.find({ storeId: store._id }).lean();

    const lowStockItems: any[] = [];
    products.forEach((p) => {
      p.sizes.forEach((s) => {
        const available = s.quantity - (s.reserved || 0);
        if (available <= 2) {
          lowStockItems.push({
            productId: p._id,
            productName: p.name,
            brand: p.brand,
            image: p.images[0],
            size: s.size,
            quantity: s.quantity,
            reserved: s.reserved || 0,
            available,
          });
        }
      });
    });

    res.json(lowStockItems);
  } catch (error) {
    next(error);
  }
};
