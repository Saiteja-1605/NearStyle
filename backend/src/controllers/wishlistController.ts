import { Request, Response, NextFunction } from 'express';
import { Wishlist } from '../models/Wishlist';
import { Product } from '../models/Product';

// @desc Get customer's wishlist
// @route GET /api/wishlist
export const getWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    let wishlist = await Wishlist.findOne({ customerId: req.user.id })
      .populate({
        path: 'products',
        populate: { path: 'storeId', select: 'name city area' },
      });

    if (!wishlist) {
      wishlist = await Wishlist.create({ customerId: req.user.id, products: [] });
    }

    res.json(wishlist.products || []);
  } catch (error) {
    next(error);
  }
};

// @desc Toggle product in wishlist (Add / Remove)
// @route POST /api/wishlist/toggle
export const toggleWishlist = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Unauthorized' });
      return;
    }

    const { productId } = req.body;
    if (!productId) {
      res.status(400).json({ message: 'Product ID is required.' });
      return;
    }

    let wishlist = await Wishlist.findOne({ customerId: req.user.id });
    if (!wishlist) {
      wishlist = new Wishlist({ customerId: req.user.id, products: [] });
    }

    const prodIdStr = productId.toString();
    const index = wishlist.products.findIndex((p: any) => p.toString() === prodIdStr);

    let added = false;
    if (index > -1) {
      wishlist.products.splice(index, 1);
      added = false;
    } else {
      wishlist.products.push(productId as any);
      added = true;
    }

    await wishlist.save();

    res.json({
      message: added ? 'Product added to wishlist' : 'Product removed from wishlist',
      added,
      productIds: wishlist.products,
    });
  } catch (error) {
    next(error);
  }
};
