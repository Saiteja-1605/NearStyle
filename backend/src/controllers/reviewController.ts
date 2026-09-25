import { Request, Response, NextFunction } from 'express';
import { Review } from '../models/Review';
import { Product } from '../models/Product';
import { Order } from '../models/Order';

// @desc Add a review for a product
// @route POST /api/reviews
export const createReview = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ message: 'Authentication required' });
      return;
    }

    const { productId, rating, comment } = req.body;

    if (!productId || !rating || !comment) {
      res.status(400).json({ message: 'Product ID, rating (1-5), and review text are required.' });
      return;
    }

    const product = await Product.findById(productId);
    if (!product) {
      res.status(404).json({ message: 'Product not found.' });
      return;
    }

    // Check duplicate
    const existing = await Review.findOne({ productId, customerId: req.user.id });
    if (existing) {
      res.status(400).json({ message: 'You have already reviewed this product.' });
      return;
    }

    const review = await Review.create({
      productId,
      customerId: req.user.id,
      customerName: req.user.name,
      rating: Number(rating),
      comment: comment.trim(),
    });

    // Recompute product average rating
    const allReviews = await Review.find({ productId });
    const avg = allReviews.reduce((sum, r) => sum + r.rating, 0) / allReviews.length;

    product.rating = Math.round(avg * 10) / 10;
    product.numReviews = allReviews.length;
    await product.save();

    res.status(201).json({
      message: 'Review posted successfully',
      review,
      averageRating: product.rating,
    });
  } catch (error) {
    next(error);
  }
};

// @desc Get reviews for a product
// @route GET /api/reviews/product/:productId
export const getProductReviews = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const reviews = await Review.find({ productId: req.params.productId }).sort({ createdAt: -1 });
    res.json(reviews);
  } catch (error) {
    next(error);
  }
};
